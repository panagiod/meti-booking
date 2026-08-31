import { describe, it, expect } from "vitest";
import { calculatePrices } from "@/lib/pricing";

describe("lib/pricing — calculatePrices", () => {
  it("without discount: fee on original price, total = earnings + fee", () => {
    const p = calculatePrices({ servicePriceCents: 10000, feePercentage: 15 });
    expect(p).toEqual({
      advisorEarning: 10000,
      platformFee: 1500,
      totalCents: 11500,
    });
  });

  it("the advisor absorbs the discount, the platform keeps its fee", () => {
    const p = calculatePrices({
      servicePriceCents: 10000,
      feePercentage: 15,
      discountCents: 2000,
    });
    expect(p.advisorEarning).toBe(8000);
    expect(p.platformFee).toBe(1500);
    expect(p.totalCents).toBe(9500);
  });

  it("discount cannot leave earnings negative", () => {
    const p = calculatePrices({
      servicePriceCents: 10000,
      feePercentage: 15,
      discountCents: 50000,
    });
    expect(p.advisorEarning).toBe(0);
    expect(p.totalCents).toBe(p.platformFee);
  });

  it("rounds the fee to the nearest cent", () => {
    const p = calculatePrices({ servicePriceCents: 9999, feePercentage: 15 });
    expect(p.platformFee).toBe(Math.round(9999 * 0.15));
    expect(p.platformFee).toBe(1500);
  });

  it("fee percentage 0 → total = earnings", () => {
    const p = calculatePrices({ servicePriceCents: 5000, feePercentage: 0 });
    expect(p).toEqual({ advisorEarning: 5000, platformFee: 0, totalCents: 5000 });
  });
});
