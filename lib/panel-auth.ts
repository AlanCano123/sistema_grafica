// Sesión + roles del panel — fase de prueba (2 cuentas fijas, no un
// sistema de usuarios real con alta/baja). Antes de manejar datos reales
// de clientes en serio, esto hay que reemplazarlo por usuarios de
// verdad en D1.
//
// Diseño de la cookie: firmada (HMAC-SHA256, Web Crypto puro — sin KV/D1),
// no un id opaco en KV. Motivo: no hay forma confirmada de que
// middleware.ts tenga acceso a bindings de Cloudflare bajo OpenNext
// (nada documentado, y justo hoy tuvimos una sorpresa de plataforma con
// proxy.ts) — una cookie firmada se verifica en cualquier lado sin
// depender de eso. La verificación real (firma + rol) se hace en
// requireAuth()/requireAdmin(), llamados desde Server Components/Actions
// (con getCloudflareContext() garantizado) — middleware.ts solo hace un
// gate barato de "¿existe la cookie?".
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { USER_HOME_PATH, type Role } from "./panel-roles";

export type { Role };

export const SESSION_COOKIE = "panel_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8hs

// Password = PBKDF2-SHA256, 100k iteraciones, formato "saltHex:hashHex".
// Generados una vez con Web Crypto (ver plan) — nunca en texto plano.
const USERS: { user: string; role: Role; passwordHash: string }[] = [
  {
    user: "admin",
    role: "admin",
    passwordHash: "8694694252cc612f779530f14f1180fe:a50c47516c153ef517be7fa5c942dbcce33d91c0414b4d5383c5438f90c23af0",
  },
  {
    user: "usuario",
    role: "usuario",
    passwordHash: "cffa2e10200a1abdb655ca6553ade870:3aa7ec674bfe477d78e2fc338a3cc8c09c28bd350cdfa5172bd10db23ae13cb0",
  },
];

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array<ArrayBuffer> {
  // `new ArrayBuffer(...)` explícito (no solo `new Uint8Array(n)`) para
  // que el tipo quede `Uint8Array<ArrayBuffer>` — Web Crypto (BufferSource)
  // no acepta `Uint8Array<ArrayBufferLike>` en TS con lib DOM reciente.
  const buf = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

/** Compara dos hex strings en tiempo constante (evita timing attacks al comparar hashes/firmas). */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function pbkdf2Hex(password: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return bufToHex(bits);
}

function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return Promise.resolve(false);
  return pbkdf2Hex(password, hexToBuf(saltHex)).then((computed) => timingSafeEqualHex(computed, hashHex));
}

/** `null` si las credenciales no matchean ningún usuario. */
export async function findUser(user: string, password: string): Promise<{ user: string; role: Role } | null> {
  const match = USERS.find((u) => u.user === user);
  if (!match) return null;
  const ok = await verifyPassword(password, match.passwordHash);
  return ok ? { user: match.user, role: match.role } : null;
}

// --- Cookie firmada ---------------------------------------------------

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function getSessionSecret(): Promise<string> {
  const { env } = await getCloudflareContext({ async: true });
  const secret = env.SESSION_SECRET;
  if (!secret) throw new Error("Falta SESSION_SECRET (.dev.vars local / Secret de Cloudflare en producción)");
  return secret;
}

export async function signSession(user: string, role: Role): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${user}.${role}.${expires}`;
  const key = await hmacKey(await getSessionSecret());
  const sig = bufToHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  return `${payload}.${sig}`;
}

async function verifySession(cookieValue: string): Promise<{ user: string; role: Role } | null> {
  const parts = cookieValue.split(".");
  if (parts.length !== 4) return null;
  const [user, role, expiresStr, sig] = parts;
  const payload = `${user}.${role}.${expiresStr}`;

  const key = await hmacKey(await getSessionSecret());
  const expectedSig = bufToHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  if (!timingSafeEqualHex(sig, expectedSig)) return null;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;
  if (role !== "admin" && role !== "usuario") return null;

  return { user, role };
}

// --- Uso desde Server Components / Server Actions ----------------------

/** Sesión válida requerida. Si no hay o venció/no verifica, redirige a /panel/login. */
export async function requireAuth(): Promise<{ user: string; role: Role }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const session = raw ? await verifySession(raw) : null;
  if (!session) redirect("/panel/login");
  return session;
}

/** Como requireAuth(), pero además exige rol admin. Si no, redirige a la home de usuario (no a login — ya está logueado). */
export async function requireAdmin(): Promise<{ user: string; role: Role }> {
  const session = await requireAuth();
  if (session.role !== "admin") redirect(USER_HOME_PATH);
  return session;
}

// --- Rate limit de intentos de login (KV) -------------------------------

const LOGIN_ATTEMPTS_MAX = 5;
const LOGIN_ATTEMPTS_WINDOW_MS = 15 * 60 * 1000;

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for") ?? "unknown";
}

/** `true` si YA superó el máximo de intentos fallidos en la ventana actual (hay que bloquear el login). */
export async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const raw = await env.KV.get<{ count: number; windowStart: number }>(`login-attempts:${ip}`, "json");
    if (!raw) return false;
    if (Date.now() - raw.windowStart > LOGIN_ATTEMPTS_WINDOW_MS) return false; // ventana vieja, ya no cuenta
    return raw.count >= LOGIN_ATTEMPTS_MAX;
  } catch (err) {
    console.error("[panel-auth] Error leyendo rate-limit de KV:", err);
    return false; // si KV falla, no bloqueamos login por un problema nuestro
  }
}

/** Suma 1 intento fallido — se llama en CUALQUIER fallo (honeypot, Turnstile, credenciales), así un bot no "ahorra" intentos saltándose chequeos. */
export async function recordFailedAttempt(ip: string): Promise<void> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const key = `login-attempts:${ip}`;
    const raw = await env.KV.get<{ count: number; windowStart: number }>(key, "json");
    const now = Date.now();
    const fresh = !raw || now - raw.windowStart > LOGIN_ATTEMPTS_WINDOW_MS;
    const next = fresh ? { count: 1, windowStart: now } : { count: raw!.count + 1, windowStart: raw!.windowStart };
    await env.KV.put(key, JSON.stringify(next), { expirationTtl: Math.ceil(LOGIN_ATTEMPTS_WINDOW_MS / 1000) + 60 });
  } catch (err) {
    console.error("[panel-auth] Error guardando rate-limit en KV:", err);
  }
}

export async function clearFailedAttempts(ip: string): Promise<void> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    await env.KV.delete(`login-attempts:${ip}`);
  } catch (err) {
    console.error("[panel-auth] Error limpiando rate-limit de KV:", err);
  }
}
