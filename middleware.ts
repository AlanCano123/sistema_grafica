// Gate de acceso a /panel — login básico (ver lib/panel-auth.ts).
//
// Next 16 renombró "middleware.ts" a "proxy.ts", PERO "proxy" fuerza
// runtime Node.js y no se puede cambiar — y @opennextjs/cloudflare NO
// soporta Node.js middleware en Workers ("ERROR Node.js middleware is
// not currently supported. Consider switching to Edge Middleware.",
// falló el deploy real con proxy.ts). La propia doc de Next 16 dice
// "If you want to continue using the edge runtime, keep using
// middleware" (node_modules/next/dist/docs/.../upgrading/version-16.md)
// — por eso este archivo se queda en la convención vieja a propósito,
// no es un descuido.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/panel-auth";

// Gate BARATO a propósito: solo mira si existe la cookie, no verifica su
// firma ni el rol (eso pasa en requireAuth()/requireAdmin(), llamados
// desde Server Components/Actions con acceso real a bindings de
// Cloudflare vía getCloudflareContext() — no hay forma confirmada de que
// ESTE archivo lo tenga bajo OpenNext). Este es solo el primer filtro
// para no renderizar nada a un anónimo; la verificación de verdad (y el
// chequeo de rol) es responsabilidad de lib/panel-auth.ts.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // La página de login (y su Server Action, que postea al mismo path)
  // tiene que quedar afuera del gate — si no, nunca se podría llegar a
  // loguearse.
  if (pathname === "/panel/login") {
    return NextResponse.next();
  }

  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL("/panel/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
