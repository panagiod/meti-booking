/** Accounts that should always get /admin on this single-studio site. */
export const DEFAULT_STUDIO_ADMIN_EMAILS = [
  "barridasg@gmail.com",
  "tyrri_meropi@hotmail.com",
];

function parseEmailList(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/** Defaults plus any extra addresses in STUDIO_ADMIN_EMAILS / STUDIO_ADMIN_EMAIL. */
export function studioAdminEmails(): string[] {
  const fromEnv = parseEmailList(
    `${process.env.STUDIO_ADMIN_EMAILS || ""},${process.env.STUDIO_ADMIN_EMAIL || ""}`
  );
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const email of [...DEFAULT_STUDIO_ADMIN_EMAILS, ...fromEnv]) {
    if (seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }
  return emails;
}

export function isStudioAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return studioAdminEmails().includes(email.trim().toLowerCase());
}
