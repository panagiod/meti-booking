import { prisma } from "@/lib/prisma";
import {
  sendBookingConfirmedEmail,
  sendNewBookingEmail,
  sendReminderEmail,
  type AppointmentEmailData,
} from "@/lib/email";
import { getAppUrl } from "@/lib/mercadopago";

// Carga la cita con las relaciones necesarias para notificar
async function loadAppointmentForNotify(appointmentId: string) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      client: { select: { email: true, name: true } },
      advisor: { include: { user: { select: { email: true, name: true } } } },
      service: { select: { name: true } },
    },
  });
}

// Envía los emails de confirmación de pago (cliente + asesor).
// Retorna false si no hay API key de email configurada.
export async function notifyAppointmentConfirmed(appointmentId: string): Promise<boolean> {
  const apt = await loadAppointmentForNotify(appointmentId);
  if (!apt) return false;

  const clientEmail = apt.client.email;
  const advisorEmail = apt.advisor.user.email;

  const base: AppointmentEmailData = {
    advisorName: apt.advisor.user.name,
    clientName: apt.client.name,
    serviceName: apt.service.name,
    scheduledAt: apt.scheduledAt.toISOString(),
    totalCents: apt.totalCents,
    appointmentUrl: `${getAppUrl()}/dashboard/appointments`,
  };

  let sent = false;
  if (apt.client.email) sent = (await sendBookingConfirmedEmail(clientEmail, base)) || sent;

  // Asesor usa /advisor/schedule
  if (apt.advisor.user.email) {
    const advisorBase = { ...base, appointmentUrl: `${getAppUrl()}/advisor/schedule` };
    sent = (await sendNewBookingEmail(advisorEmail, advisorBase)) || sent;
  }
  return sent;
}

// Envía el recordatorio 24h antes de la asesoría (cliente + asesor).
export async function notifyAppointmentReminder(appointmentId: string): Promise<boolean> {
  const apt = await loadAppointmentForNotify(appointmentId);
  if (!apt) return false;

  const base: AppointmentEmailData = {
    advisorName: apt.advisor.user.name,
    clientName: apt.client.name,
    serviceName: apt.service.name,
    scheduledAt: apt.scheduledAt.toISOString(),
    totalCents: apt.totalCents,
    appointmentUrl: `${getAppUrl()}/dashboard/appointments`,
  };

  let sent = false;
  if (apt.client.email) sent = (await sendReminderEmail(apt.client.email, base, "cliente")) || sent;

  if (apt.advisor.user.email) {
    const advisorBase = { ...base, appointmentUrl: `${getAppUrl()}/advisor/schedule` };
    sent = (await sendReminderEmail(apt.advisor.user.email, advisorBase, "asesor")) || sent;
  }
  return sent;
}
