import { describe, it, expect } from "vitest";
import {
  DEFAULT_BOOKING_LEAD_HOURS,
  DEFAULT_CANCEL_HOURS,
  MAX_CANCEL_HOURS,
  MIN_CANCEL_HOURS,
  resolveBookingLeadHours,
  resolveCancelHours,
} from "@/lib/booking-config";
import { siteConfig } from "@/lib/site-config";

describe("booking-config", () => {
  it("DEFAULT_BOOKING_LEAD_HOURS matches siteConfig", () => {
    expect(DEFAULT_BOOKING_LEAD_HOURS).toBe(siteConfig.defaultBookingLeadHours);
    expect(DEFAULT_BOOKING_LEAD_HOURS).toBe(2);
  });

  it("resolveBookingLeadHours uses studio default when unset", () => {
    expect(resolveBookingLeadHours(null)).toBe(2);
    expect(resolveBookingLeadHours(undefined)).toBe(2);
  });

  it("resolveBookingLeadHours preserves explicit values", () => {
    expect(resolveBookingLeadHours(6)).toBe(6);
    expect(resolveBookingLeadHours(24)).toBe(24);
  });

  it("resolveBookingLeadHours treats 0 as no lead time", () => {
    expect(resolveBookingLeadHours(0)).toBe(0);
  });

  it("defaults cancel window to 12 hours", () => {
    expect(DEFAULT_CANCEL_HOURS).toBe(12);
    expect(resolveCancelHours(null)).toBe(12);
    expect(resolveCancelHours(undefined)).toBe(12);
    expect(resolveCancelHours(0)).toBe(12);
    expect(resolveCancelHours(99)).toBe(12);
  });

  it("preserves admin cancel hours within range", () => {
    expect(resolveCancelHours(1)).toBe(MIN_CANCEL_HOURS);
    expect(resolveCancelHours(12)).toBe(12);
    expect(resolveCancelHours(24)).toBe(24);
    expect(resolveCancelHours(72)).toBe(MAX_CANCEL_HOURS);
  });
});
