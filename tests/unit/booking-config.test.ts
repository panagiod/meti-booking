import { describe, it, expect } from "vitest";
import {
  DEFAULT_BOOKING_LEAD_HOURS,
  DEFAULT_CANCEL_HOURS,
  DEFAULT_SLOT_CAPACITY,
  DEFAULT_BOOKING_WEEKS_AHEAD,
  MAX_CANCEL_HOURS,
  MIN_CANCEL_HOURS,
  MAX_SLOT_CAPACITY,
  MIN_SLOT_CAPACITY,
  MAX_BOOKING_WEEKS_AHEAD,
  MIN_BOOKING_WEEKS_AHEAD,
  resolveBookingLeadHours,
  resolveCancelHours,
  resolveSlotCapacity,
  resolveBookingWeeksAhead,
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

  it("defaults slot capacity to 3 and booking window to 8 weeks", () => {
    expect(DEFAULT_SLOT_CAPACITY).toBe(3);
    expect(resolveSlotCapacity(null)).toBe(3);
    expect(resolveSlotCapacity(0)).toBe(3);
    expect(resolveSlotCapacity(99)).toBe(3);
    expect(DEFAULT_BOOKING_WEEKS_AHEAD).toBe(8);
    expect(resolveBookingWeeksAhead(null)).toBe(8);
    expect(resolveBookingWeeksAhead(0)).toBe(8);
    expect(resolveBookingWeeksAhead(20)).toBe(8);
  });

  it("preserves admin slot capacity and booking window within range", () => {
    expect(resolveSlotCapacity(1)).toBe(MIN_SLOT_CAPACITY);
    expect(resolveSlotCapacity(3)).toBe(3);
    expect(resolveSlotCapacity(6)).toBe(6);
    expect(resolveSlotCapacity(12)).toBe(MAX_SLOT_CAPACITY);
    expect(resolveBookingWeeksAhead(1)).toBe(MIN_BOOKING_WEEKS_AHEAD);
    expect(resolveBookingWeeksAhead(8)).toBe(8);
    expect(resolveBookingWeeksAhead(16)).toBe(MAX_BOOKING_WEEKS_AHEAD);
  });
});
