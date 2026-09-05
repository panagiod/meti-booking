import { describe, expect, it } from "vitest";
import { canClientCancelAppointment, isAutomatedTestEmail } from "@/lib/appointment-cancel";

describe("canClientCancelAppointment", () => {
  const scheduledAt = new Date("2026-09-10T14:00:00Z");

  it("allows cancelling pending bookings anytime", () => {
    expect(
      canClientCancelAppointment({
        status: "PENDING",
        scheduledAt,
        rescheduleHoursMin: 24,
        now: new Date("2026-09-10T13:00:00Z"),
      }).allowed
    ).toBe(true);
  });

  it("allows cancelling confirmed bookings before the lead window", () => {
    expect(
      canClientCancelAppointment({
        status: "CONFIRMED",
        scheduledAt,
        rescheduleHoursMin: 24,
        now: new Date("2026-09-09T12:00:00Z"),
      }).allowed
    ).toBe(true);
  });

  it("blocks confirmed cancellations inside the lead window", () => {
    const result = canClientCancelAppointment({
      status: "CONFIRMED",
      scheduledAt,
      rescheduleHoursMin: 24,
      now: new Date("2026-09-10T02:00:00Z"),
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("24 hours");
    expect(result.reason).toContain("still be paid");
  });

  it("blocks completed appointments", () => {
    expect(
      canClientCancelAppointment({
        status: "COMPLETED",
        scheduledAt,
        rescheduleHoursMin: 24,
      }).allowed
    ).toBe(false);
  });
});

describe("isAutomatedTestEmail", () => {
  it("matches leftover production smoke emails", () => {
    expect(isAutomatedTestEmail("prod-e2e-1@example.com")).toBe(true);
    expect(isAutomatedTestEmail("cookie-check-1@example.com")).toBe(true);
    expect(isAutomatedTestEmail("client@studio.com")).toBe(false);
  });
});
