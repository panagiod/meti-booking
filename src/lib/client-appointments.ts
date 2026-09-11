export type ClientAppointmentRecord = {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  status: string;
  totalCents: number;
  paidAt: Date | null;
  service: { name: string; rescheduleHoursMin: number };
  instructor: { user: { name: string; image: string | null } };
  review: { id: string; rating: number; comment: string | null } | null;
};

/** Logged-in client booking list — paid/unpaid only, not who paid. */
export function toClientAppointment(appointment: ClientAppointmentRecord) {
  return {
    id: appointment.id,
    scheduledAt: appointment.scheduledAt.toISOString(),
    durationMin: appointment.durationMin,
    status: appointment.status,
    totalCents: appointment.totalCents,
    paidAt: appointment.paidAt ? appointment.paidAt.toISOString() : null,
    service: {
      name: appointment.service.name,
      rescheduleHoursMin: appointment.service.rescheduleHoursMin,
    },
    instructor: {
      user: {
        name: appointment.instructor.user.name,
        image: appointment.instructor.user.image,
      },
    },
    review: appointment.review
      ? {
          id: appointment.review.id,
          rating: appointment.review.rating,
          comment: appointment.review.comment,
        }
      : null,
  };
}
