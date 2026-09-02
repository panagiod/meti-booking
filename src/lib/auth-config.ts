function normalizeOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim().replace(/\/$/, "");
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function addOrigin(origins: Set<string>, value: string | undefined) {
  const origin = normalizeOrigin(value);
  if (origin) origins.add(origin);
}

/** Public base URL for better-auth (server-side). */
export function getAuthBaseURL(): string {
  const configured = normalizeOrigin(process.env.BETTER_AUTH_URL);

  if (configured && !isLocalhostOrigin(configured)) {
    return configured;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return configured || "http://localhost:3000";
}

/** Origins allowed for better-auth (base URL + optional comma-separated extras). */
export function getTrustedAuthOrigins(): string[] {
  const origins = new Set<string>();

  addOrigin(origins, getAuthBaseURL());
  addOrigin(origins, process.env.BETTER_AUTH_URL);
  addOrigin(origins, process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
  addOrigin(origins, process.env.APP_URL);

  const extras =
    process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
      .map((o) => o.trim())
      .filter(Boolean) ?? [];

  for (const extra of extras) {
    addOrigin(origins, extra);
  }

  if (process.env.VERCEL_URL) {
    addOrigin(origins, process.env.VERCEL_URL);
  }
  if (process.env.VERCEL_BRANCH_URL) {
    addOrigin(origins, process.env.VERCEL_BRANCH_URL);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    addOrigin(origins, process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }

  return [...origins];
}

/** Client-side auth base URL — prefer the live browser origin on hosted previews. */
export function getClientAuthBaseURL(): string {
  if (typeof window !== "undefined") {
    const browserOrigin = window.location.origin;
    const configured = normalizeOrigin(process.env.NEXT_PUBLIC_BETTER_AUTH_URL);

    if (!configured || isLocalhostOrigin(configured)) {
      return browserOrigin;
    }

    return configured;
  }

  return normalizeOrigin(process.env.NEXT_PUBLIC_BETTER_AUTH_URL) || getAuthBaseURL();
}
