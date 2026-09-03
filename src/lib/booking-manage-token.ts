import { createHmac, timingSafeEqual } from "crypto";

export const MANAGE_TOKEN_TTL_MS = 60 * 24 * 60 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function signingSecret(): string {
  const secret =
    process.env.BETTER_AUTH_SECRET?.trim() || process.env.CRON_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing BETTER_AUTH_SECRET");
  }
  return secret;
}

function sign(appointmentId: string, exp: number, email: string): string {
  const payload = `${appointmentId}.${exp}.${normalizeEmail(email)}`;
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

export function createManageToken(
  appointmentId: string,
  email: string,
  now = Date.now()
): string {
  const exp = now + MANAGE_TOKEN_TTL_MS;
  const sig = sign(appointmentId, exp, email);
  return `${appointmentId}.${exp}.${sig}`;
}

export function parseManageToken(
  token: string
): { appointmentId: string; exp: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [appointmentId, expStr] = parts;
  const exp = Number(expStr);
  if (!appointmentId || !Number.isFinite(exp)) return null;
  if (Date.now() > exp) return null;
  return { appointmentId, exp };
}

export function verifyManageToken(token: string, email: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [appointmentId, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!appointmentId || !Number.isFinite(exp) || Date.now() > exp) return false;

  let expected: string;
  try {
    expected = sign(appointmentId, exp, email);
  } catch {
    return false;
  }

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
