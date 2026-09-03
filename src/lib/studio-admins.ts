/** Google accounts that should always get /admin on this single-studio site. */
export const DEFAULT_STUDIO_ADMIN_EMAILS = ["barridasg@gmail.com"];

function parseEmailList(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/** STUDIO_ADMIN_EMAILS / STUDIO_ADMIN_EMAIL override the default owner list. */
export function studioAdminEmails(): string[] {
  const fromEnv = parseEmailList(
    `${process.env.STUDIO_ADMIN_EMAILS || ""},${process.env.STUDIO_ADMIN_EMAIL || ""}`
  );
  return fromEnv.length > 0 ? fromEnv : [...DEFAULT_STUDIO_ADMIN_EMAILS];
}

export function isStudioAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return studioAdminEmails().includes(email.trim().toLowerCase());
}
