/** The only real studio client name to keep when purging test accounts. */
export const KEEP_STUDIO_CLIENT_NAME = "Γεωργία Δημητρίου";

export function foldPersonName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** True when the account name is the real client (accents and word order ignored). */
export function isKeptStudioClientName(
  name: string,
  keepName = KEEP_STUDIO_CLIENT_NAME
): boolean {
  const folded = foldPersonName(name);
  if (!folded) return false;
  const tokens = foldPersonName(keepName).split(" ").filter(Boolean);
  return tokens.length > 0 && tokens.every((token) => folded.includes(token));
}
