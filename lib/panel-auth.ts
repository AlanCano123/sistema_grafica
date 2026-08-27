// Login del panel — fase de prueba. 2 cuentas fijas, contraseñas en
// texto plano A PROPÓSITO (admin/admin, usuario/usuario). NO es un
// sistema de usuarios real: no hay alta/baja, no hay hash. Antes de
// manejar datos sensibles de clientes en serio, reemplazar por usuarios
// en D1 con contraseña hasheada.
//
// La cookie de sesión va firmada (HMAC-SHA256) con un secreto fijo de
// este archivo. No es para secretismo real — es sólo para que nadie se
// autoproclame "admin" editando la cookie a mano en el navegador. Todo
// self-contained: sin Turnstile, sin KV, sin variables de entorno, para
// que el login no dependa de nada que se pueda romper en el deploy.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { USER_HOME_PATH, type Role } from "./panel-roles";

export type { Role };

export const SESSION_COOKIE = "panel_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8hs

const USERS: { user: string; pass: string; role: Role }[] = [
  { user: "admin", pass: "admin", role: "admin" },
  { user: "usuario", pass: "usuario", role: "usuario" },
];

// Secreto de firma de la cookie. Fijo a propósito (ver comentario arriba).
const COOKIE_SIGNING_SECRET = "laserkind-panel-2026-8f3a1c9e4b7d2a6f";

/** `null` si usuario/contraseña no matchean ninguna cuenta. */
export function findUser(user: string, password: string): { user: string; role: Role } | null {
  const match = USERS.find((u) => u.user === user && u.pass === password);
  return match ? { user: match.user, role: match.role } : null;
}

// --- Cookie firmada ---------------------------------------------------

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Compara dos hex strings en tiempo constante (evita timing attacks). */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(COOKIE_SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(user: string, role: Role): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${user}.${role}.${expires}`;
  const sig = bufToHex(await crypto.subtle.sign("HMAC", await hmacKey(), new TextEncoder().encode(payload)));
  return `${payload}.${sig}`;
}

async function verifySession(cookieValue: string): Promise<{ user: string; role: Role } | null> {
  const parts = cookieValue.split(".");
  if (parts.length !== 4) return null;
  const [user, role, expiresStr, sig] = parts;
  const payload = `${user}.${role}.${expiresStr}`;

  const expectedSig = bufToHex(await crypto.subtle.sign("HMAC", await hmacKey(), new TextEncoder().encode(payload)));
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
