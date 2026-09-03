import { prisma } from "@/lib/prisma";
import { isAutomatedTestEmail } from "@/lib/appointment-cancel";
import { isStudioAdminEmail } from "@/lib/studio-admins";

export const BOOKING_IP_LIMIT = 5;
export const BOOKING_IP_WINDOW_MS = 60 * 60 * 1000;
export const BOOKING_EMAIL_LIMIT = 3;
export const BOOKING_EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000;
export const BOOKING_UPCOMING_LIMIT = 8;

const ipHits = new Map<string, number[]>();

export function isBookingRateLimitDisabled(): boolean {
  return process.env.DISABLE_RATE_LIMIT === "1";
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function resetBookingRateLimitState(): void {
  ipHits.clear();
}

/** Returns true when this IP is still within the hourly booking cap. */
export function recordAndCheckIpLimit(ip: string, now = Date.now()): boolean {
  const key = ip.trim() || "unknown";
  const previous = ipHits.get(key) ?? [];
  const recent = previous.filter((ts) => now - ts < BOOKING_IP_WINDOW_MS);
  if (recent.length >= BOOKING_IP_LIMIT) {
    ipHits.set(key, recent);
    return false;
  }
  recent.push(now);
  ipHits.set(key, recent);
  return true;
}

export async function checkClientBookingLimits(clientId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - BOOKING_EMAIL_WINDOW_MS);

  const [recentCount, upcomingCount] = await Promise.all([
    prisma.appointment.count({
      where: {
        clientId,
        createdAt: { gte: dayAgo },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
    }),
    prisma.appointment.count({
      where: {
        clientId,
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        scheduledAt: { gte: now },
      },
    }),
  ]);

  if (recentCount >= BOOKING_EMAIL_LIMIT) {
    return {
      ok: false,
      error: "This email has reached the daily booking limit. Please try again tomorrow.",
    };
  }

  if (upcomingCount >= BOOKING_UPCOMING_LIMIT) {
    return {
      ok: false,
      error: "You already have too many upcoming sessions. Cancel one before booking another.",
    };
  }

  return { ok: true };
}

export async function assertBookingRateLimit(input: {
  ip: string;
  email: string;
  clientId: string;
  hasSession?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (
    isBookingRateLimitDisabled() ||
    isAutomatedTestEmail(input.email) ||
    isStudioAdminEmail(input.email)
  ) {
    return { ok: true };
  }

  if (!input.hasSession && !recordAndCheckIpLimit(input.ip)) {
    return {
      ok: false,
      error: "Too many booking attempts from this network. Please try again later.",
    };
  }

  const clientLimit = await checkClientBookingLimits(input.clientId);
  if (!clientLimit.ok) {
    return { ok: false, error: clientLimit.error ?? "Too many bookings." };
  }

  return { ok: true };
}
