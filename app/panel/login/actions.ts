"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUser, signSession, SESSION_COOKIE } from "@/lib/panel-auth";
import { USER_HOME_PATH } from "@/lib/panel-roles";

export async function loginAction(formData: FormData) {
  const user = String(formData.get("user") ?? "");
  const pass = String(formData.get("pass") ?? "");

  const match = findUser(user, pass);
  if (!match) {
    redirect("/panel/login?error=1");
  }

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
