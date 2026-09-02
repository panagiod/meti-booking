import type { AppointmentStatus } from "@/generated/prisma/client";

const CLIENT_CANCELLABLE: AppointmentStatus[] = ["PENDING", "CONFIRMED"];

export function hoursUntilAppointment(scheduledAt: Date, now = new Date()): number {
  return (scheduledAt.getTime() - now.getTime()) / (60 * 60 * 1000);
}

export function canClientCancelAppointment(input: {
  status: AppointmentStatus;
  scheduledAt: Date;
  rescheduleHoursMin: number;
  now?: Date;
}): { allowed: boolean; reason?: string } {
  const now = input.now ?? new Date();

  if (!CLIENT_CANCELLABLE.includes(input.status)) {
    return { allowed: false, reason: "This appointment cannot be cancelled online." };
  }

  if (input.status === "PENDING") {
    return { allowed: true };
  }

  const hoursLeft = hoursUntilAppointment(input.scheduledAt, now);
  if (hoursLeft < input.rescheduleHoursMin) {
    return {
      allowed: false,
      reason: `Cancellation must be at least ${input.rescheduleHoursMin} hours before the session.`,
    };
  }

  return { allowed: true };
}

export function canAdvisorCancelAppointment(status: AppointmentStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED" || status === "IN_PROGRESS";
}
