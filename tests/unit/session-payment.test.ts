import { describe, expect, it } from "vitest";
import {
  isPayableSessionStatus,
  isSessionPaid,
  isUnpaidPayableSession,
  normalizePaidByName,
  unpaidSessionTotalCents,
} from "@/lib/session-payment";

describe("isPayableSessionStatus", () => {
  it("treats completed and no-show sessions as owed", () => {
    expect(isPayableSessionStatus("COMPLETED")).toBe(true);
    expect(isPayableSessionStatus("NO_SHOW")).toBe(true);
    expect(isPayableSessionStatus("CONFIRMED")).toBe(false);
    expect(isPayableSessionStatus("CANCELLED")).toBe(false);
  });
});

describe("isUnpaidPayableSession", () => {
  it("counts only completed sessions with paidAt set to null", () => {
    expect(isUnpaidPayableSession({ status: "COMPLETED", paidAt: null })).toBe(true);
    expect(isUnpaidPayableSession({ status: "NO_SHOW", paidAt: null })).toBe(true);
    expect(
      isUnpaidPayableSession({ status: "COMPLETED", paidAt: "2026-09-11T12:00:00.000Z" })
    ).toBe(false);
    expect(isUnpaidPayableSession({ status: "COMPLETED" })).toBe(false);
    expect(isUnpaidPayableSession({ status: "CONFIRMED", paidAt: null })).toBe(false);
  });
});

describe("isSessionPaid", () => {
  it("is paid when paidAt is present", () => {
    expect(isSessionPaid({ paidAt: "2026-09-11T12:00:00.000Z" })).toBe(true);
    expect(isSessionPaid({ paidAt: null })).toBe(false);
    expect(isSessionPaid({})).toBe(false);
  });
});

describe("unpaidSessionTotalCents", () => {
  it("sums unpaid completed and no-show amounts and skips tests", () => {
    expect(
      unpaidSessionTotalCents([
        { status: "COMPLETED", paidAt: null, totalCents: 3500 },
        { status: "NO_SHOW", paidAt: null, totalCents: 3500 },
        { status: "COMPLETED", paidAt: "2026-09-11T12:00:00.000Z", totalCents: 3500 },
        { status: "CONFIRMED", paidAt: null, totalCents: 3500 },
        { status: "COMPLETED", paidAt: null, totalCents: 3500, isTest: true },
      ])
    ).toBe(7000);
  });
});

describe("normalizePaidByName", () => {
  it("trims, collapses spaces, and caps length", () => {
    expect(normalizePaidByName("  Maria  Papadopoulou  ")).toBe("Maria Papadopoulou");
    expect(normalizePaidByName("")).toBe(null);
    expect(normalizePaidByName("   ")).toBe(null);
    expect(normalizePaidByName(12)).toBe(null);
    expect(normalizePaidByName("x".repeat(200))?.length).toBe(120);
  });
});
