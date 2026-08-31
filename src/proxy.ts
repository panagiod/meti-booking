import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes (no session required)
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

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if there is a session (cookie present)
  const sessionCookie = request.cookies.get("better-auth.session_token");
  if (!sessionCookie) {
    // No session: checkout and call are public
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
