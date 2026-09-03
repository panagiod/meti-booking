import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPayment } from "@/lib/mercadopago";
import { notifyAppointmentConfirmed } from "@/lib/notify";
import {
  assertPaymentMatchesAppointment,
  assertPaymentIdNotReused,
  PaymentVerificationError,
} from "@/lib/payment-verify";
import { decryptMpAccessToken } from "@/lib/instructor-mp";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId required" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { instructor: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (appointment.status === "CONFIRMED") {
      return NextResponse.json({ ok: true, alreadyConfirmed: true });
    }

    const mpToken = decryptMpAccessToken(appointment.instructor.mpAccessToken);
    if (!mpToken) {
      return NextResponse.json({ error: "Advisor has no MP credentials" }, { status: 400 });
    }

    await assertPaymentIdNotReused(paymentId, appointment.id);

    const payment = await getPayment(mpToken, paymentId);
    assertPaymentMatchesAppointment(payment, appointment);

    const wasPending = appointment.status === "PENDING";
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CONFIRMED", paymentId },
    });

    if (wasPending) {
      try {
        await notifyAppointmentConfirmed(appointment.id);
      } catch (e) {
        console.error("Error sending confirmation emails:", e);
      }
    }

    return NextResponse.json({ ok: true, confirmed: true });
  } catch (error) {
    if (error instanceof PaymentVerificationError) {
      const status = error.code === "NOT_APPROVED" ? 200 : 400;
      return NextResponse.json(
        { ok: false, error: error.message, code: error.code },
        { status }
      );
    }
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
