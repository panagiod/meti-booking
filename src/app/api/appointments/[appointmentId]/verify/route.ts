import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/mercadopago";
import { notifyAppointmentConfirmed } from "@/lib/notify";

// POST: Verify payment directly with MP and confirm the appointment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId required" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { advisor: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.status === "CONFIRMED") {
      return NextResponse.json({ ok: true, alreadyConfirmed: true });
    }

    if (!appointment.advisor.mpAccessToken) {
      return NextResponse.json({ error: "Advisor has no MP credentials" }, { status: 400 });
    }

    // Verify payment directly with the MP API (no custody)
    const payment = await getPayment(appointment.advisor.mpAccessToken, paymentId);

    if (payment?.status === "approved") {
      const wasPending = appointment.status === "PENDING";
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: "CONFIRMED", paymentId },
      });
      // Send confirmation emails only if it was pending (avoids duplicates)
      if (wasPending) {
        try {
          await notifyAppointmentConfirmed(appointment.id);
        } catch (e) {
          console.error("Error sending confirmation emails:", e);
        }
      }
      return NextResponse.json({ ok: true, confirmed: true });
    }

    return NextResponse.json({
      ok: true,
      confirmed: false,
      paymentStatus: payment?.status,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
