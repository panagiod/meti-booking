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

// POST: Mercado Pago webhook (Checkout Pro)
// Receives payment and merchant_order notifications. NEVER trust the
// body: payment is verified against the MP API with the advisor's access token.
export async function POST(request: NextRequest) {
  try {
    const notification = (await request.json()) as PaymentNotification;
    const topic = notification.type;

    // Topics we don't handle (chargebacks, refunds...): accept silently
    if (topic && topic !== "payment" && topic !== "merchant_order") {
      return NextResponse.json({ ok: true, ignored: topic });
    }

    // Find the appointment based on notification type
    let appointmentId: string | null = null;
    const paymentId: string | null = notification.data?.id || null;

    if (topic === "merchant_order") {
      // Merchant order includes external_reference = appointment id
      appointmentId = notification.external_reference || null;
    } else if (topic === "payment" || topic === undefined) {
      // 1) By already registered payment id
      if (paymentId) {
        const found = await prisma.appointment.findFirst({
          where: { paymentId },
        });
        if (found) appointmentId = found.id;
      }
      // 2) By the preference used for payment (MP uses preferred_id,
      //    but we accept both variants for compatibility)
      const preferenceId = notification.preferred_id || notification.preference_id || notification.data?.preferred_id;
      if (!appointmentId && preferenceId) {
        const found = await prisma.appointment.findFirst({
          where: { mpPreferenceId: preferenceId },
        });
        if (found) appointmentId = found.id;
      }
      // 3) By external_reference (some MP versions include it)
      if (!appointmentId && notification.external_reference) {
        appointmentId = notification.external_reference;
      }
    }

    if (!appointmentId) {
      // No known appointment: request retry later
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

    // No-op if already confirmed (idempotency)
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

    // Actual payment verification with the advisor's token (no custody)
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
      // Confirmation emails (only if it was PENDING, avoids duplicates)
      if (wasPending) {
        try {
          await notifyAppointmentConfirmed(appointment.id);
        } catch (e) {
          console.error("Error sending confirmation emails:", e);
        }
      }
      return NextResponse.json({ ok: true, confirmed: true });
    }

    // Pending, rejected, in process... do not confirm yet
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

// MP responds to GET with 200 to validate that the webhook is alive
export async function GET() {
  return NextResponse.json({ ok: true });
}
