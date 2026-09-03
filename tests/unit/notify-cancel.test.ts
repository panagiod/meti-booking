import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendBookingCancelledClientEmail: vi.fn(),
  sendBookingCancelledStudioEmail: vi.fn(),
  sendBookingConfirmedEmail: vi.fn(),
  sendNewBookingEmail: vi.fn(),
  sendReminderEmail: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import {
  sendBookingCancelledClientEmail,
  sendBookingCancelledStudioEmail,
} from "@/lib/email";
import { notifyAppointmentCancelled } from "@/lib/notify";

const appointment = {
  id: "apt-1",
  scheduledAt: new Date("2026-09-05T05:45:00.000Z"),
  totalCents: 1000,
  cancelReason: "Cancelled via booking link",
  client: { email: "client@studio.com", name: "Alex" },
  instructor: { user: { email: "instructor@meti-pilates.com", name: "Meropi Tirri" } },
  service: { name: "Reformer Session" },
};

describe("notifyAppointmentCancelled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("STUDIO_NOTIFICATION_EMAIL", "tyrri_meropi@hotmail.com");
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue(appointment as never);
    vi.mocked(sendBookingCancelledClientEmail).mockResolvedValue(true);
    vi.mocked(sendBookingCancelledStudioEmail).mockResolvedValue(true);
  });

  it("emails the studio when a client cancels", async () => {
    const sent = await notifyAppointmentCancelled("apt-1", { cancelledBy: "client" });
    expect(sent).toBe(true);
    expect(sendBookingCancelledClientEmail).toHaveBeenCalledWith(
      "client@studio.com",
      expect.objectContaining({ cancelledByStudio: false })
    );
    expect(sendBookingCancelledStudioEmail).toHaveBeenCalledWith(
      "tyrri_meropi@hotmail.com",
      expect.objectContaining({
        clientName: "Alex",
        serviceName: "Reformer Session",
      })
    );
  });

  it("does not email the studio when the studio cancels", async () => {
    const sent = await notifyAppointmentCancelled("apt-1", { cancelledBy: "studio" });
    expect(sent).toBe(true);
    expect(sendBookingCancelledClientEmail).toHaveBeenCalledWith(
      "client@studio.com",
      expect.objectContaining({ cancelledByStudio: true })
    );
    expect(sendBookingCancelledStudioEmail).not.toHaveBeenCalled();
  });

  it("skips automated test bookings", async () => {
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
      ...appointment,
      client: { email: "prod-e2e-guest@example.com", name: "Test" },
    } as never);

    const sent = await notifyAppointmentCancelled("apt-1", { cancelledBy: "client" });
    expect(sent).toBe(false);
    expect(sendBookingCancelledClientEmail).not.toHaveBeenCalled();
    expect(sendBookingCancelledStudioEmail).not.toHaveBeenCalled();
  });
});
