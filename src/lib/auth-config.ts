/** Origins allowed for better-auth (base URL + optional comma-separated extras). */
export function getTrustedAuthOrigins(): string[] {
  const origins = new Set<string>();

  const base = process.env.BETTER_AUTH_URL?.trim().replace(/\/$/, "");
  if (base) origins.add(base);

  const extras =
    process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean) ?? [];

  for (const origin of extras) {
    origins.add(origin);
  }

  return [...origins];
}
