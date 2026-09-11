import { describe, expect, it } from "vitest";
import { toClientAppointment } from "@/lib/client-appointments";

describe("toClientAppointment", () => {
  it("exposes paid status without who paid", () => {
    const view = toClientAppointment({
      id: "apt_1",
      scheduledAt: new Date("2026-09-04T12:45:00.000Z"),
      durationMin: 45,
      status: "COMPLETED",
      totalCents: 3500,
      paidAt: new Date("2026-09-11T10:00:00.000Z"),
      service: { name: "Reformer Session", rescheduleHoursMin: 24 },
      instructor: { user: { name: "Meropi", image: null } },
      review: null,
    });

    expect(view.paidAt).toBe("2026-09-11T10:00:00.000Z");
    expect(view).not.toHaveProperty("paidByName");
    expect(view).not.toHaveProperty("paidRecordedByEmail");
    expect(view.service.name).toBe("Reformer Session");
  });

  it("returns null paidAt for unpaid sessions", () => {
    const view = toClientAppointment({
      id: "apt_2",
      scheduledAt: new Date("2026-09-04T12:45:00.000Z"),
      durationMin: 45,
      status: "COMPLETED",
      totalCents: 3500,
      paidAt: null,
      service: { name: "Reformer Session", rescheduleHoursMin: 24 },
      instructor: { user: { name: "Meropi", image: null } },
      review: null,
    });

    expect(view.paidAt).toBeNull();
  });
});
