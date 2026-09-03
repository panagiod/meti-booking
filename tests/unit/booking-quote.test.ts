import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildBookingQuote } from "@/lib/booking-quote";

describe("lib/booking-quote — buildBookingQuote", () => {
  beforeEach(() => {
    vi.stubEnv("PAYMENTS_ENABLED", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns session price only when payments are disabled", () => {
    const quote = buildBookingQuote({
      serviceId: "svc-1",
      serviceName: "Reformer Session",
      servicePriceCents: 5000,
      feePercentage: 15,
      maxFeeCents: null,
    });

    expect(quote).toMatchObject({
      servicePriceCents: 5000,
      platformFeeCents: 0,
      instructorEarningCents: 5000,
      totalCents: 5000,
      feePercentage: 0,
    });
  });

  it("applies discounts without platform fees when payments are disabled", () => {
    const quote = buildBookingQuote({
      serviceId: "svc-1",
      serviceName: "Reformer Session",
      servicePriceCents: 5000,
      discountCents: 1000,
    });

    expect(quote.totalCents).toBe(4000);
    expect(quote.platformFeeCents).toBe(0);
    expect(quote.instructorEarningCents).toBe(4000);
  });

  it("includes platform fees when payments are enabled", () => {
    vi.stubEnv("PAYMENTS_ENABLED", "1");

    const quote = buildBookingQuote({
      serviceId: "svc-1",
      serviceName: "Reformer Session",
      servicePriceCents: 10000,
      feePercentage: 15,
    });

    expect(quote.platformFeeCents).toBe(1500);
    expect(quote.totalCents).toBe(11500);
    expect(quote.feePercentage).toBe(15);
  });
});
