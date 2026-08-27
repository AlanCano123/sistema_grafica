"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { findUser, getClientIp, isRateLimited, recordFailedAttempt, clearFailedAttempts, signSession, SESSION_COOKIE } from "@/lib/panel-auth";
import { USER_HOME_PATH } from "@/lib/panel-roles";

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const secret = env.TURNSTILE_SECRET;
    if (!secret) {
      console.error("[login] Falta TURNSTILE_SECRET");
      return false;
    }
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success: boolean; action?: string };
    return data.success && (data.action === undefined || data.action === "login");
  } catch (err) {
    console.error("[login] Error verificando Turnstile:", err);
    return false;
  }
}

export async function loginAction(formData: FormData) {
  const ip = await getClientIp();

  if (await isRateLimited(ip)) {
    redirect("/panel/login?error=rate_limit");
  }

  // Honeypot: campo oculto que un usuario real nunca completa. Si viene
  // lleno, es un bot — se rechaza sin ni mirar usuario/contraseña, pero
  // SÍ cuenta como intento fallido (que no se pueda "gastar" el rate
  // limit gratis saltándose este chequeo).
  const honeypot = String(formData.get("website") ?? "");
  if (honeypot !== "") {
    await recordFailedAttempt(ip);
    redirect("/panel/login?error=1");
  }

  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");
  if (!turnstileToken || !(await verifyTurnstile(turnstileToken, ip))) {
    await recordFailedAttempt(ip);
    redirect("/panel/login?error=bot");
  }

  const user = String(formData.get("user") ?? "");
  const pass = String(formData.get("pass") ?? "");
  const match = await findUser(user, pass);

  if (!match) {
    await recordFailedAttempt(ip);
    redirect("/panel/login?error=1");
  }

  await clearFailedAttempts(ip);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await signSession(match.user, match.role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8hs
  });

  // admin va al Resumen; "usuario" no lo ve (muestra plata) -> a su home.
  redirect(match.role === "admin" ? "/panel" : USER_HOME_PATH);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/panel/login");
}
