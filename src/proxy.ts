import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/redirect",
  "/api/auth",
  "/services",
  "/privacy",
  "/terms",
  "/book",
  "/blog",
  "/faq",
  "/api/studio",
  "/api/slots",
  "/api/categories",
  "/api/promotions",
  "/api/checkout/quote",
  "/api/appointments",
  "/api/advisors",
  "/api/services",
  // Token-authenticated (not cookie-based) — see src/lib/admin-promote.ts
  "/api/ops/promote-admin",
];

/** Platform advisor dashboard paths (require login). Public profile pages use /advisor/{id}. */
const ADVISOR_PLATFORM_SEGMENTS = new Set([
  "schedule",
  "services",
  "profile",
  "promotions",
  "payments",
  "mercadopago",
]);

function isPublicAdvisorProfile(pathname: string): boolean {
  const match = pathname.match(/^\/advisor\/([^/]+)$/);
  if (!match) return false;
  return !ADVISOR_PLATFORM_SEGMENTS.has(match[1]);
}

function isPublicPath(pathname: string): boolean {
  if (isPublicAdvisorProfile(pathname)) return true;
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.getAll().find((cookie) =>
    cookie.name.includes("better-auth.session_token")
  );

  if (pathname.startsWith("/api/admin")) {
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (!sessionCookie) {
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
