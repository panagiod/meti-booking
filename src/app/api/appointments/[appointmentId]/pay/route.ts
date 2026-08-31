import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createCheckoutPreference } from "@/lib/mercadopago";
import { decryptMpAccessToken } from "@/lib/advisor-mp";

// POST: Regenerate MercadoPago checkout link for a pending appointment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        advisor: true,
        service: true,
        client: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Only the client who owns the appointment can retry payment
    if (appointment.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only PENDING appointments can have payment retried
    if (appointment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only appointments with pending payment can retry payment" },
        { status: 400 }
      );
    }

    const mpToken = decryptMpAccessToken(appointment.advisor.mpAccessToken);
    if (!mpToken) {
      return NextResponse.json(
        { error: "The advisor does not have a Mercado Pago account configured" },
        { status: 400 }
      );
    }

    const { preferenceId, initPoint, sandboxInitPoint } =
      await createCheckoutPreference({
        accessToken: mpToken,
        items: [
          {
            id: appointment.service.id,
            title: appointment.service.name,
            unitPriceCents: appointment.totalCents,
          },
        ],
        externalReference: appointment.id,
        payerEmail: appointment.client.email,
      });

    // Update the appointment with the new preference ID
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { mpPreferenceId: preferenceId },
    });

    const isTest = appointment.advisor.mpMode === "TEST";
    const checkoutUrl = isTest && sandboxInitPoint ? sandboxInitPoint : initPoint;

    return NextResponse.json({ initPoint: checkoutUrl, preferenceId });
  } catch (error) {
    console.error("Error regenerating payment link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
