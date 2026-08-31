import { Resend } from "resend";
import { getAppUrl } from "@/lib/mercadopago";

const FROM_EMAIL = process.env.EMAIL_FROM || "Meti <notificaciones@cognilab.dev>";

// Cliente Resend lazy: solo se inicializa si hay API key configurada
let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
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
        Meti — Asesorías profesionales online · <a href="${getAppUrl()}" style="color:#ff6b35;">${getAppUrl()}</a>
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

// Email al cliente: confirmación de reserva (pago aprobado)
export async function sendBookingConfirmedEmail(
  to: string,
  data: AppointmentEmailData
): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  const body = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hola <strong>${data.clientName}</strong>, tu pago fue aprobado y tu asesoría está confirmada:</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;">Asesor</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.advisorName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Servicio</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.serviceName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Fecha y hora</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${formatDate(data.scheduledAt)}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Total pagado</td><td style="padding:8px 0;font-weight:600;color:#ff6b35;text-align:right;">${formatCurrency(data.totalCents)}</td></tr>
    </table>
    <a href="${data.appointmentUrl}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">Ver mi cita</a>
  `;

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `✓ Asesoría confirmada: ${data.serviceName} con ${data.advisorName}`,
    html: layout("¡Tu asesoría está confirmada!", body),
  });

  return !error;
}

// Email al asesor: nueva reserva
export async function sendNewBookingEmail(
  to: string,
  data: AppointmentEmailData
): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  const body = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hola <strong>${data.advisorName}</strong>, tienes una nueva asesoría reservada:</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;">Cliente</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.clientName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Servicio</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.serviceName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Fecha y hora</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${formatDate(data.scheduledAt)}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Valor</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${formatCurrency(data.totalCents)}</td></tr>
    </table>
    <a href="${data.appointmentUrl}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">Ver mi agenda</a>
  `;

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `🔔 Nueva reserva: ${data.serviceName} el ${formatDate(data.scheduledAt)}`,
    html: layout("¡Tienes una nueva reserva!", body),
  });

  return !error;
}

// Email de recordatorio 24h antes de la asesoría
export async function sendReminderEmail(
  to: string,
  data: AppointmentEmailData,
  role: "cliente" | "asesor"
): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  const greeting =
    role === "cliente"
      ? `Hola <strong>${data.clientName}</strong>, recuerda que mañana tienes tu asesoría:`
      : `Hola <strong>${data.advisorName}</strong>, recuerda que mañana tienes una asesoría:`;

  const counterparty =
    role === "cliente" ? data.advisorName : data.clientName;

  const body = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">${greeting}</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;">${role === "cliente" ? "Asesor" : "Cliente"}</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${counterparty}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Servicio</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.serviceName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Fecha y hora</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${formatDate(data.scheduledAt)}</td></tr>
    </table>
    <a href="${data.appointmentUrl}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">${role === "cliente" ? "Ver mi cita" : "Ver mi agenda"}</a>
  `;

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `⏰ Recordatorio: ${data.serviceName} mañana ${formatDate(data.scheduledAt)}`,
    html: layout("Recordatorio de asesoría", body),
  });

  return !error;
}

// Email de resumen de asesoría
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

  // Convertir markdown básico a HTML
  const summaryHtml = data.summary
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p style='margin:0 0 12px;color:#374151;line-height:1.6;'>")
    .replace(/\n- /g, "</p><li style='margin:0 0 8px;color:#374151;line-height:1.6;'>")
    .replace(/\n/g, "<br/>");

  const body = `
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hola <strong>${data.clientName}</strong>,</p>
    <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Tu asesoría con <strong>${data.advisorName}</strong> ha finalizado. Aquí tienes el resumen:</p>
    
    <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #e5e7eb;">
      <h3 style="margin:0 0 12px;color:#1a1a2e;font-size:16px;">📋 Resumen de la asesoría</h3>
      <div style="color:#374151;line-height:1.8;font-size:14px;">
        <p style="margin:0 0 12px;">${summaryHtml}</p>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;">Servicio</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${data.serviceName}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Fecha</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;text-align:right;">${formatDate(data.scheduledAt)}</td></tr>
    </table>

    <a href="${data.appointmentUrl}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">Agendar otra cita</a>
  `;

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `📋 Resumen: ${data.serviceName} - ${formatDate(data.scheduledAt)}`,
    html: layout("Resumen de asesoría", body),
  });

  return !error;
}
