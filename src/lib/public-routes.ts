/** Paths that do not require a session cookie. Prefix matches `path` and `path/...`. */
export const PUBLIC_PATHS = [
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
  "/cookies",
  "/refunds",
  "/resources",
  "/stories",
  "/book",
  "/booking",
  "/blog",
  "/faq",
  "/advisor",
  "/api/studio",
  "/api/health",
  "/api/slots",
  "/api/categories",
  "/api/promotions",
  "/api/checkout/quote",
  "/api/appointments",
  // Token-authenticated (not cookie-based) — see src/lib/admin-promote.ts
  "/api/ops/promote-admin",
] as const;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
