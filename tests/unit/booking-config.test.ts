import { describe, it, expect } from "vitest";
import {
  DEFAULT_BOOKING_LEAD_HOURS,
  resolveBookingLeadHours,
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
});
