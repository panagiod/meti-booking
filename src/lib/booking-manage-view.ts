import { siteConfig } from "@/lib/site-config";
import { canClientCancelAppointment } from "@/lib/appointment-cancel";

export type ManagedAppointmentRecord = {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  status: Parameters<typeof canClientCancelAppointment>[0]["status"];
  totalCents: number;
  service: { name: string; rescheduleHoursMin: number };
  instructor: { user: { name: string } };
};

/** Public manage-link payload — no client name or email. */
export function toPublicManagedAppointment(appointment: ManagedAppointmentRecord) {
  const check = canClientCancelAppointment({
    status: appointment.status,
    scheduledAt: appointment.scheduledAt,
    rescheduleHoursMin: appointment.service.rescheduleHoursMin,
  });
  return {
    id: appointment.id,
    scheduledAt: appointment.scheduledAt.toISOString(),
    durationMin: appointment.durationMin,
    status: appointment.status,
    totalCents: appointment.totalCents,
    currency: siteConfig.currency,
    serviceName: appointment.service.name,
    instructorName: appointment.instructor.user.name,
    cancellable: check.allowed,
    cancelReason: check.reason ?? null,
  };
}
