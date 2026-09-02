import { Resend } from "resend";
import { getAppUrl } from "@/lib/mercadopago";
import { siteConfig } from "@/lib/site-config";
import { STUDIO_TIMEZONE } from "@/lib/timezone";

const FROM_EMAIL = process.env.EMAIL_FROM || "MeTi Pilates <bookings@meti-pilates.com>";

// Lazy Resend client: only initialized if API key is configured
let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: STUDIO_TIMEZONE,
  });
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: siteConfig.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:Inter,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#1a1a2e;">
        <tr>
          <td style="padding:24px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="32" height="32" align="center" valign="middle" style="background:#ff6b35;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:800;color:#ffffff;line-height:32px;">M</td>
                <td style="padding-left:10px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#ffffff;">Meti</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#1a1a2e;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:16px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
        Meti — Professional online consultations · <a href="${getAppUrl()}" style="color:#ff6b35;">${getAppUrl()}</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export interface AppointmentEmailData {
  advisorName: string;
  clientName: string;
  serviceName: string;
  scheduledAt: string;
  totalCents: number;
  appointmentUrl: string;
}

// Client email: booking confirmation (payment approved)
export async function sendBookingConfirmedEmail(
  to: string,
  data: AppointmentEmailData
): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  const body = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hi <strong>${data.clientName}</strong>, your reformer session is confirmed:</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;">Studio</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.advisorName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Service</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.serviceName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Date and time</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${formatDate(data.scheduledAt)}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Session price</td><td style="padding:8px 0;font-weight:600;color:#ff6b35;text-align:right;">${formatCurrency(data.totalCents)}</td></tr>
    </table>
    <a href="${data.appointmentUrl}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">View my booking</a>
  `;

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `✓ Booking confirmed: ${data.serviceName}`,
    html: layout("Your session is confirmed!", body),
  });

  return !error;
}

// Advisor email: new booking
export async function sendNewBookingEmail(
  to: string,
  data: AppointmentEmailData
): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  const body = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">You have a new reformer session booking:</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;">Client</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.clientName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Service</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.serviceName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Date and time</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${formatDate(data.scheduledAt)}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Amount</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${formatCurrency(data.totalCents)}</td></tr>
    </table>
    <a href="${data.appointmentUrl}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">View my schedule</a>
  `;

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `🔔 New booking: ${data.serviceName} — ${data.clientName}`,
    html: layout("New session booked", body),
  });

  return !error;
}

// Reminder email 24h before the consultation
export async function sendReminderEmail(
  to: string,
  data: AppointmentEmailData,
  role: "client" | "advisor"
): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  const greeting =
    role === "client"
      ? `Hi <strong>${data.clientName}</strong>, remember that tomorrow you have your consultation:`
      : `Hi <strong>${data.advisorName}</strong>, remember that tomorrow you have a consultation:`;

  const counterparty =
    role === "client" ? data.advisorName : data.clientName;

  const body = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">${greeting}</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;">${role === "client" ? "Advisor" : "Client"}</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${counterparty}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Service</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.serviceName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Date and time</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${formatDate(data.scheduledAt)}</td></tr>
    </table>
    <a href="${data.appointmentUrl}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">${role === "client" ? "View my appointment" : "View my schedule"}</a>
  `;

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `⏰ Reminder: ${data.serviceName} tomorrow ${formatDate(data.scheduledAt)}`,
    html: layout("Consultation reminder", body),
  });

  return !error;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  const body = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">We received a request to reset your MeTi Pilates account password.</p>
    <p style="margin:0 0 20px;color:#374151;line-height:1.6;">Click the button below to choose a new password. This link expires in 1 hour.</p>
    <a href="${resetUrl}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">Reset password</a>
    <p style="margin:20px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">If you did not request this, you can ignore this email.</p>
  `;

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your MeTi Pilates password",
    html: layout("Reset your password", body),
  });

  return !error;
}

// Consultation summary email
export async function sendSummaryEmail(
  to: string,
  data: {
    clientName: string;
    advisorName: string;
    serviceName: string;
    scheduledAt: string;
    summary: string;
    appointmentUrl: string;
  }
): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  // Convert basic markdown to HTML
  const summaryHtml = data.summary
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p style='margin:0 0 12px;color:#374151;line-height:1.6;'>")
    .replace(/\n- /g, "</p><li style='margin:0 0 8px;color:#374151;line-height:1.6;'>")
    .replace(/\n/g, "<br/>");

  const body = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hi <strong>${data.clientName}</strong>,</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Your consultation with <strong>${data.advisorName}</strong> has ended. Here is the summary:</p>
    
    <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #e5e7eb;">
      <h3 style="margin:0 0 12px;color:#1a1a2e;font-size:16px;">📋 Consultation summary</h3>
      <div style="color:#374151;line-height:1.8;font-size:14px;">
        <p style="margin:0 0 12px;">${summaryHtml}</p>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;">Service</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.serviceName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Date</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${formatDate(data.scheduledAt)}</td></tr>
    </table>

    <a href="${data.appointmentUrl}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">Book another appointment</a>
  `;

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `📋 Summary: ${data.serviceName} - ${formatDate(data.scheduledAt)}`,
    html: layout("Consultation summary", body),
  });

  return !error;
}
