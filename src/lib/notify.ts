import { prisma } from "@/lib/prisma";
import {
  sendBookingConfirmedEmail,
  sendNewBookingEmail,
  sendReminderEmail,
  type AppointmentEmailData,
} from "@/lib/email";
import { getStudioNotificationEmail } from "@/lib/site-config";
import { getAppUrl } from "@/lib/mercadopago";

// Load the appointment with the relations needed for notifications
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

// Send payment confirmation emails (client + advisor).
// Returns false if no email API key is configured.
export async function notifyAppointmentConfirmed(appointmentId: string): Promise<boolean> {
  const apt = await loadAppointmentForNotify(appointmentId);
  if (!apt) return false;

  const clientEmail = apt.client.email;
  const advisorEmail = apt.advisor.user.email?.trim().toLowerCase();
  const studioEmail = getStudioNotificationEmail().trim().toLowerCase();

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

  const studioBase = { ...base, appointmentUrl: `${getAppUrl()}/advisor/schedule` };

  if (studioEmail) {
    sent = (await sendNewBookingEmail(studioEmail, studioBase)) || sent;
  }

  if (advisorEmail && advisorEmail !== studioEmail) {
    sent = (await sendNewBookingEmail(advisorEmail, studioBase)) || sent;
  }
  return sent;
}

// Send the 24h reminder before the consultation (client + advisor).
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
  if (apt.client.email) sent = (await sendReminderEmail(apt.client.email, base, "client")) || sent;

  const studioEmail = getStudioNotificationEmail().trim().toLowerCase();
  const advisorEmail = apt.advisor.user.email?.trim().toLowerCase();
  const advisorBase = { ...base, appointmentUrl: `${getAppUrl()}/advisor/schedule` };

  if (studioEmail) {
    sent = (await sendReminderEmail(studioEmail, advisorBase, "advisor")) || sent;
  }

  if (advisorEmail && advisorEmail !== studioEmail) {
    sent = (await sendReminderEmail(advisorEmail, advisorBase, "advisor")) || sent;
  }
  return sent;
}
