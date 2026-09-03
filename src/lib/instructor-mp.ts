import { decryptSecret, encryptSecret } from "@/lib/encryption";

export function encryptMpAccessToken(token: string): string {
  return encryptSecret(token);
}

export function decryptMpAccessToken(stored: string | null | undefined): string | null {
  if (!stored) return null;
  try {
    return decryptSecret(stored);
  } catch (error) {
    console.error("Failed to decrypt MP access token:", error);
    return null;
  }
}

export function instructorMpConnected(
  profile: { mpPublicKey?: string | null; mpAccessToken?: string | null } | null
): boolean {
  return !!(profile?.mpPublicKey && profile?.mpAccessToken);
}
