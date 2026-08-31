import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas públicas (no requieren sesión)
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/redirect",
  "/api/auth",
  "/services",
  "/privacy",
  "/terms",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir archivos estáticos y assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Verificar si hay sesión (cookie presente)
  const sessionCookie = request.cookies.get("better-auth.session_token");
  if (!sessionCookie) {
    // Sin sesión: checkout y call son públicos
    if (pathname.startsWith("/checkout") || pathname.startsWith("/call")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
