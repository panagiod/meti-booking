import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { createCheckoutPreference } from "@/lib/mercadopago";
import { parseLocalISO } from "@/lib/timezone";
import { calculatePrices } from "@/lib/pricing";

const appointmentSchema = z.object({
  advisorId: z.string(),
  serviceId: z.string(),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/),
  discountCents: z.number().min(0).default(0),
  promotionId: z.string().nullable().default(null),
});

// POST: Create appointment (PENDING) + Mercado Pago Checkout Pro preference
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { advisorId, serviceId, scheduledAt, discountCents, promotionId } = appointmentSchema.parse(body);

    // Get advisor profile
    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { id: advisorId },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor not found" }, { status: 404 });
    }

    if (!advisorProfile.mpAccessToken) {
      return NextResponse.json(
        { error: "Advisor has no Mercado Pago account configured" },
        { status: 400 }
      );
    }

    // Get service with category
    const service = await prisma.advisorService.findUnique({
      where: { id: serviceId },
      include: {
        category: {
          select: {
            feePercentage: true,
            minimumPriceCents: true,
            maxFeeCents: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Get fee percentage and max fee from service's category (or defaults)
    let feePercentage = 15; // Default
    let maxFeeCents: number | null = null;
    if (service.category) {
      feePercentage = service.category.feePercentage;
      maxFeeCents = service.category.maxFeeCents;
    }

    // Calculate prices — the fee is ALWAYS calculated on the ORIGINAL price
    // (the advisor absorbs the discount; the platform keeps its commission).
    // If the fee exceeds maxFeeCents, maxFeeCents is used.
    const { advisorEarning, platformFee, totalCents } = calculatePrices({
      servicePriceCents: service.priceCents,
      feePercentage,
      maxFeeCents,
      discountCents,
    });

    // Parse local date/time (Colombia) from ISO and build the UTC timestamp
    // explicitly — independent of the server timezone.
    const parsedDate = parseLocalISO(scheduledAt);

    // Create appointment as PENDING: blocks the slot immediately and is
    // confirmed by the Mercado Pago webhook once payment is approved.
    const isTest = advisorProfile.mpMode === "TEST";
    const appointment = await prisma.appointment.create({
      data: {
        clientId: session.user.id,
        advisorId: advisorProfile.id,
        serviceId: serviceId,
        scheduledAt: parsedDate || new Date(scheduledAt),
        durationMin: service.durationMin,
        status: "PENDING",
        totalCents,
        advisorEarning,
        platformFee,
        discountCents,
        isTest,
      },
    });

    try {
      // Create the Checkout Pro preference with the ADVISOR's credentials
      // (no custody: payment goes directly to the advisor's account).
      const { preferenceId, initPoint, sandboxInitPoint } =
        await createCheckoutPreference({
          accessToken: advisorProfile.mpAccessToken,
          items: [
            {
              id: service.id,
              title: service.name,
              unitPriceCents: totalCents,
            },
          ],
          externalReference: appointment.id,
          payerEmail: session.user.email,
        });

      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { mpPreferenceId: preferenceId },
      });

      // In test mode, checkout must use MP's sandbox subdomain
      const checkoutUrl = isTest && sandboxInitPoint ? sandboxInitPoint : initPoint;

      return NextResponse.json(
        { appointment, initPoint: checkoutUrl, preferenceId },
        { status: 201 }
      );
    } catch (prefError) {
      // No preference = no payment possible: rollback the appointment
      await prisma.appointment.delete({ where: { id: appointment.id } });
      console.error("Error creating MP preference:", prefError);
      return NextResponse.json(
        { error: "Could not start payment in Mercado Pago. Please try again." },
        { status: 502 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
