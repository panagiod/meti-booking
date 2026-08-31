import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/mercadopago";
import { notifyAppointmentConfirmed } from "@/lib/notify";

interface PaymentNotification {
  type?: string;
  data?: { id?: string; preferred_id?: string };
  preferred_id?: string;
  preference_id?: string;
  external_reference?: string;
}

// POST: Webhook de Mercado Pago (Checkout Pro)
// Recibe notificaciones de payment y merchant_order. NUNCA se confía en el
// body: el pago se verifica contra la API de MP con el access token del asesor.
export async function POST(request: NextRequest) {
  try {
    const notification = (await request.json()) as PaymentNotification;
    const topic = notification.type;

    // Temas que no manejamos (chargebacks, refunds...): aceptar silenciosamente
    if (topic && topic !== "payment" && topic !== "merchant_order") {
      return NextResponse.json({ ok: true, ignored: topic });
    }

    // Buscar la cita según el tipo de notificación
    let appointmentId: string | null = null;
    const paymentId: string | null = notification.data?.id || null;

    if (topic === "merchant_order") {
      // La orden de mercado incluye external_reference = appointment id
      appointmentId = notification.external_reference || null;
    } else if (topic === "payment" || topic === undefined) {
      // 1) Por payment id ya registrado
      if (paymentId) {
        const found = await prisma.appointment.findFirst({
          where: { paymentId },
        });
        if (found) appointmentId = found.id;
      }
      // 2) Por la preferencia desde la que se pagó (MP usa preferred_id,
      //    pero aceptamos ambas variantes por compatibilidad)
      const preferenceId = notification.preferred_id || notification.preference_id || notification.data?.preferred_id;
      if (!appointmentId && preferenceId) {
        const found = await prisma.appointment.findFirst({
          where: { mpPreferenceId: preferenceId },
        });
        if (found) appointmentId = found.id;
      }
      // 3) Por external_reference (algunas versiones de MP lo incluyen)
      if (!appointmentId && notification.external_reference) {
        appointmentId = notification.external_reference;
      }
    }

    if (!appointmentId) {
      // Sin cita conocida: pedir reintento más tarde
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        advisor: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // No-op si ya está confirmada (idempotencia)
    if (appointment.status === "CONFIRMED" && paymentId && !appointment.paymentId) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { paymentId },
      });
      return NextResponse.json({ ok: true });
    }

    if (appointment.status !== "PENDING") {
      return NextResponse.json({ ok: true, status: appointment.status });
    }

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment id missing" },
        { status: 400 }
      );
    }

    if (!appointment.advisor.mpAccessToken) {
      console.error(
        `Advisor ${appointment.advisorId} has no MP access token (appointment ${appointment.id})`
      );
      return NextResponse.json(
        { error: "Advisor has no MP credentials" },
        { status: 400 }
      );
    }

    // Verificación real del pago con el token del asesor (sin custodia)
    let payment;
    try {
      payment = await getPayment(appointment.advisor.mpAccessToken, paymentId);
    } catch (mpError) {
      console.error("MP payment verification failed:", mpError);
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 502 }
      );
    }

    const paymentStatus = payment?.status;

    if (paymentStatus === "approved") {
      const wasPending = appointment.status === "PENDING";
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "CONFIRMED",
          paymentId,
        },
      });
      // Emails de confirmación (solo si venía de PENDING, evita duplicados)
      if (wasPending) {
        try {
          await notifyAppointmentConfirmed(appointment.id);
        } catch (e) {
          console.error("Error sending confirmation emails:", e);
        }
      }
      return NextResponse.json({ ok: true, confirmed: true });
    }

    // Pago pendiente, rechazado, en proceso... no confirmar aún
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { paymentId },
    });

    return NextResponse.json({ ok: true, paymentStatus });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// MP responde a GET con un 200 para validar que el webhook está vivo
export async function GET() {
  return NextResponse.json({ ok: true });
}
