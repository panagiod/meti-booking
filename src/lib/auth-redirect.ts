/** Safe in-app path after login. Rejects open redirects and auth pages that loop. */
export function isSafeAuthNext(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//") || value.includes("://")) return false;
  const path = value.split("?")[0];
  if (
    path === "/login" ||
    path === "/register" ||
    path === "/redirect" ||
    path === "/forgot-password" ||
    path === "/reset-password"
  ) {
    return false;
  }
  return true;
}

export function homePathForRole(role?: string | null): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "ADVISOR":
      return "/advisor";
    default:
      return "/dashboard";
  }
}

export function loginUrl(next?: string | null): string {
  if (isSafeAuthNext(next)) {
    return `/login?next=${encodeURIComponent(next)}`;
  }
  return "/login";
}

export function googleCallbackUrl(next?: string | null): string {
  if (isSafeAuthNext(next)) {
    return `/redirect?next=${encodeURIComponent(next)}`;
  }
  return "/redirect";
}

export function postAuthPath(role: string | null | undefined, next?: string | null): string {
  if (isSafeAuthNext(next)) return next;
  return homePathForRole(role);
}
