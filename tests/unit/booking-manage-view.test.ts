import { describe, expect, it } from "vitest";
import { toPublicManagedAppointment } from "@/lib/booking-manage-view";

describe("public managed appointment", () => {
  it("omits client name and email", () => {
    const scheduledAt = new Date("2026-10-01T12:00:00.000Z");
    const view = toPublicManagedAppointment({
      id: "apt_1",
      scheduledAt,
      durationMin: 45,
      status: "CONFIRMED",
      totalCents: 1000,
      service: { name: "Reformer Session", rescheduleHoursMin: 24 },
      instructor: { user: { name: "Meropi" } },
    });

    expect(view).not.toHaveProperty("clientEmail");
    expect(view).not.toHaveProperty("clientName");
    expect(view.serviceName).toBe("Reformer Session");
    expect(view.instructorName).toBe("Meropi");
    expect(view.id).toBe("apt_1");
  });
});
