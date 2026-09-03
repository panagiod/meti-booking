import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertBookingRateLimit,
  recordAndCheckIpLimit,
  resetBookingRateLimitState,
  BOOKING_IP_LIMIT,
} from "@/lib/booking-rate-limit";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: {
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("booking rate limit", () => {
  beforeEach(() => {
    resetBookingRateLimitState();
    vi.mocked(prisma.appointment.count).mockResolvedValue(0);
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("caps bookings per IP per hour", () => {
    for (let i = 0; i < BOOKING_IP_LIMIT; i += 1) {
      expect(recordAndCheckIpLimit("1.2.3.4")).toBe(true);
    }
    expect(recordAndCheckIpLimit("1.2.3.4")).toBe(false);
    expect(recordAndCheckIpLimit("9.9.9.9")).toBe(true);
  });

  it("skips limits when DISABLE_RATE_LIMIT=1", async () => {
    vi.stubEnv("DISABLE_RATE_LIMIT", "1");
    const result = await assertBookingRateLimit({
      ip: "1.2.3.4",
      email: "person@studio.com",
      clientId: "client-1",
    });
    expect(result.ok).toBe(true);
    expect(prisma.appointment.count).not.toHaveBeenCalled();
  });

  it("skips limits for studio admin emails", async () => {
    const result = await assertBookingRateLimit({
      ip: "1.2.3.4",
      email: "meropityrri@gmail.com",
      clientId: "client-1",
    });
    expect(result.ok).toBe(true);
    expect(prisma.appointment.count).not.toHaveBeenCalled();
  });

  it("skips limits for automated test emails", async () => {
    const result = await assertBookingRateLimit({
      ip: "1.2.3.4",
      email: "prod-e2e-guest@example.com",
      clientId: "client-1",
    });
    expect(result.ok).toBe(true);
    expect(prisma.appointment.count).not.toHaveBeenCalled();
  });

  it("does not apply the IP cap to signed-in clients", async () => {
    for (let i = 0; i < BOOKING_IP_LIMIT; i += 1) {
      recordAndCheckIpLimit("1.2.3.4");
    }
    const result = await assertBookingRateLimit({
      ip: "1.2.3.4",
      email: "person@studio.com",
      clientId: "client-1",
      hasSession: true,
    });
    expect(result.ok).toBe(true);
  });

  it("ignores cancelled bookings in the daily cap query", async () => {
    await assertBookingRateLimit({
      ip: "8.8.8.8",
      email: "person@studio.com",
      clientId: "client-1",
    });
    expect(prisma.appointment.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        clientId: "client-1",
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      }),
    });
  });

  it("blocks when the client already has too many recent bookings", async () => {
    vi.mocked(prisma.appointment.count)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(0);

    const result = await assertBookingRateLimit({
      ip: "8.8.8.8",
      email: "person@studio.com",
      clientId: "client-1",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/daily booking limit/i);
    }
  });
});
