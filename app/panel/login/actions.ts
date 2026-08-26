"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, SESSION_VALUE } from "@/lib/panel-auth";

export async function loginAction(formData: FormData) {
  const user = String(formData.get("user") ?? "");
  const pass = String(formData.get("pass") ?? "");

  if (!checkCredentials(user, pass)) {
    redirect("/panel/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/panel");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/panel/login");
}
