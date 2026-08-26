// Gate de acceso a /panel — login básico (ver lib/panel-auth.ts).
//
// Next 16 renombró "middleware.ts" a "proxy.ts" (mismo mecanismo, cambia
// el nombre del archivo y de la función exportada) — confirmado en
// node_modules/next/dist/docs/.../file-conventions/proxy.md.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/panel-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // La página de login (y su Server Action, que postea al mismo path)
  // tiene que quedar afuera del gate — si no, nunca se podría llegar a
  // loguearse.
  if (pathname === "/panel/login") {
    return NextResponse.next();
  }

  const isLoggedIn = request.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE;
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/panel/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
