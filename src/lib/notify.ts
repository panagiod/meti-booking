import { prisma } from "@/lib/prisma";
import {
  sendBookingConfirmedEmail,
  sendBookingCancelledClientEmail,
  sendBookingCancelledStudioEmail,
  sendNewBookingEmail,
  sendReminderEmail,
  type AppointmentEmailData,
} from "@/lib/email";
import { getStudioNotificationEmails, getSiteUrl } from "@/lib/site-config";
import { createManageToken } from "@/lib/booking-manage-token";
import { isAutomatedTestEmail } from "@/lib/appointment-cancel";

function clientManageUrl(appointmentId: string, email: string): string | undefined {
  try {
    const token = createManageToken(appointmentId, email);
    return `${getSiteUrl()}/booking/manage?t=${encodeURIComponent(token)}`;
  } catch (error) {
    console.error("Could not create booking manage token:", error);
    return undefined;
  }
}

// Load the appointment with the relations needed for notifications
async function loadAppointmentForNotify(appointmentId: string) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      client: { select: { email: true, name: true } },
      instructor: { include: { user: { select: { email: true, name: true } } } },
      service: { select: { name: true } },
    },
  });
}

// Send payment confirmation emails (client + studio).
// Returns false if no email API key is configured.
export async function notifyAppointmentConfirmed(appointmentId: string): Promise<boolean> {
  const apt = await loadAppointmentForNotify(appointmentId);
  if (!apt) return false;

  const clientEmail = apt.client.email;
  const instructorEmail = apt.instructor.user.email?.trim().toLowerCase();
  const studioEmails = getStudioNotificationEmails();
  const manageUrl = clientEmail ? clientManageUrl(apt.id, clientEmail) : undefined;

  const base: AppointmentEmailData = {
    instructorName: apt.instructor.user.name,
    clientName: apt.client.name,
    serviceName: apt.service.name,
    scheduledAt: apt.scheduledAt.toISOString(),
    totalCents: apt.totalCents,
    appointmentUrl: manageUrl || `${getSiteUrl()}/dashboard/appointments`,
    manageUrl,
  };

  let sent = false;
  if (apt.client.email) sent = (await sendBookingConfirmedEmail(clientEmail, base)) || sent;

  const studioBase = { ...base, appointmentUrl: `${getSiteUrl()}/admin/schedule` };

  for (const studioEmail of studioEmails) {
    sent = (await sendNewBookingEmail(studioEmail, studioBase)) || sent;
  }

  if (instructorEmail && !studioEmails.includes(instructorEmail)) {
    sent = (await sendNewBookingEmail(instructorEmail, studioBase)) || sent;
  }
  return sent;
}

// Send the 24h reminder before the session (client + studio).
export async function notifyAppointmentReminder(appointmentId: string): Promise<boolean> {
  const apt = await loadAppointmentForNotify(appointmentId);
  if (!apt) return false;

  const clientEmail = apt.client.email;
  const manageUrl = clientEmail ? clientManageUrl(apt.id, clientEmail) : undefined;

  const base: AppointmentEmailData = {
    instructorName: apt.instructor.user.name,
    clientName: apt.client.name,
    serviceName: apt.service.name,
    scheduledAt: apt.scheduledAt.toISOString(),
    totalCents: apt.totalCents,
    appointmentUrl: manageUrl || `${getSiteUrl()}/dashboard/appointments`,
    manageUrl,
  };

  let sent = false;
  if (apt.client.email) sent = (await sendReminderEmail(apt.client.email, base, "client")) || sent;

  const studioEmails = getStudioNotificationEmails();
  const instructorEmail = apt.instructor.user.email?.trim().toLowerCase();
  const studioBase = { ...base, appointmentUrl: `${getSiteUrl()}/admin/schedule` };

  for (const studioEmail of studioEmails) {
    sent = (await sendReminderEmail(studioEmail, studioBase, "instructor")) || sent;
  }

  if (instructorEmail && !studioEmails.includes(instructorEmail)) {
    sent = (await sendReminderEmail(instructorEmail, studioBase, "instructor")) || sent;
  }
  return sent;
}

export async function notifyAppointmentCancelled(
  appointmentId: string,
  options: { cancelledBy: "client" | "studio" } = { cancelledBy: "client" }
): Promise<boolean> {
  const apt = await loadAppointmentForNotify(appointmentId);
  if (!apt) return false;

  const clientEmail = apt.client.email;
  if (clientEmail && isAutomatedTestEmail(clientEmail)) return false;

  const instructorEmail = apt.instructor.user.email?.trim().toLowerCase();
  const studioEmails = getStudioNotificationEmails();

  const base: AppointmentEmailData = {
    instructorName: apt.instructor.user.name,
    clientName: apt.client.name,
    clientEmail: clientEmail || undefined,
    serviceName: apt.service.name,
    scheduledAt: apt.scheduledAt.toISOString(),
    totalCents: apt.totalCents,
    appointmentUrl: `${getSiteUrl()}/dashboard/appointments`,
    cancelReason: apt.cancelReason ?? undefined,
  };

  let sent = false;
  if (clientEmail) {
    sent =
      (await sendBookingCancelledClientEmail(clientEmail, {
        ...base,
        cancelledByStudio: options.cancelledBy === "studio",
      })) || sent;
  }

  if (options.cancelledBy !== "client") return sent;

  const studioBase = { ...base, appointmentUrl: `${getSiteUrl()}/admin/schedule` };
  for (const studioEmail of studioEmails) {
    sent = (await sendBookingCancelledStudioEmail(studioEmail, studioBase)) || sent;
  }

  if (instructorEmail && !studioEmails.includes(instructorEmail)) {
    sent = (await sendBookingCancelledStudioEmail(instructorEmail, studioBase)) || sent;
  }
  return sent;
}
