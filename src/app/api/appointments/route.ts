import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { createCheckoutPreference } from "@/lib/mercadopago";
import { parseLocalISO } from "@/lib/timezone";
import { calculatePrices } from "@/lib/pricing";
import { siteConfig } from "@/lib/site-config";
import { validateBookableSlot, SlotBookingError } from "@/lib/slot-booking";
import { decryptMpAccessToken } from "@/lib/advisor-mp";
import { findOrCreateGuestUser, GuestUserError } from "@/lib/guest-user";

const appointmentSchema = z.object({
  advisorId: z.string(),
  serviceId: z.string(),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/),
  promotionId: z.string().nullable().optional(),
  guestEmail: z.string().email().optional(),
  guestName: z.string().trim().min(1).max(100).optional(),
});

// POST: Create appointment (PENDING) + Mercado Pago Checkout Pro preference
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    const body = await request.json();
    const parsed = appointmentSchema.parse(body);
    const { advisorId, serviceId, scheduledAt, promotionId, guestEmail, guestName } = parsed;

    let clientId: string;
    let payerEmail: string;

    if (session) {
      clientId = session.user.id;
      payerEmail = session.user.email;
    } else {
      if (!guestEmail) {
        return NextResponse.json(
          { error: "Email is required to complete your booking" },
          { status: 401 }
        );
      }
      const guest = await findOrCreateGuestUser(guestEmail, guestName);
      clientId = guest.id;
      payerEmail = guest.email;
    }

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
        ...(promotionId
          ? {
              promotions: {
                where: {
                  id: promotionId,
                  isActive: true,
                  startAt: { lte: new Date() },
                  endAt: { gte: new Date() },
                },
                take: 1,
              },
            }
          : {}),
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    let feePercentage = 15;
    let maxFeeCents: number | null = null;
    if (service.category) {
      feePercentage = service.category.feePercentage;
      maxFeeCents = service.category.maxFeeCents;
    }

    let discountCents = 0;
    const promotion = promotionId ? service.promotions?.[0] : undefined;
    if (promotion) {
      discountCents =
        promotion.discountType === "percentage"
          ? Math.round(service.priceCents * (promotion.discountValue / 100))
          : promotion.discountValue;
      discountCents = Math.min(discountCents, service.priceCents);
    }

    const { advisorEarning, platformFee, totalCents } = calculatePrices({
      servicePriceCents: service.priceCents,
      feePercentage,
      maxFeeCents,
      discountCents,
    });

    const parsedDate = parseLocalISO(scheduledAt);
    if (!parsedDate) {
      return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
    }

    await validateBookableSlot({
      advisorId,
      serviceId,
      scheduledAt: parsedDate,
    });

    const mpToken = decryptMpAccessToken(advisorProfile.mpAccessToken);
    if (!mpToken) {
      return NextResponse.json(
        { error: "Advisor payment credentials are not configured" },
        { status: 400 }
      );
    }

    const isTest = advisorProfile.mpMode === "TEST";

    const appointment = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const bookedCount = await tx.appointment.count({
          where: {
            advisorId: advisorProfile.id,
            scheduledAt: parsedDate,
            status: { in: ["CONFIRMED", "IN_PROGRESS", "PENDING"] },
          },
        });

        if (bookedCount >= siteConfig.slotCapacity) {
          throw new Error("SLOT_FULL");
        }

        return tx.appointment.create({
          data: {
            clientId,
            advisorId: advisorProfile.id,
            serviceId: serviceId,
            scheduledAt: parsedDate,
            durationMin: service.durationMin,
            status: "PENDING",
            totalCents,
            advisorEarning,
            platformFee,
            discountCents,
            isTest,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    try {
      const { preferenceId, initPoint, sandboxInitPoint } =
        await createCheckoutPreference({
          accessToken: mpToken,
          items: [
            {
              id: service.id,
              title: service.name,
              unitPriceCents: totalCents,
            },
          ],
          externalReference: appointment.id,
          payerEmail,
        });

      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { mpPreferenceId: preferenceId },
      });

      const checkoutUrl = isTest && sandboxInitPoint ? sandboxInitPoint : initPoint;

      return NextResponse.json(
        { appointment, initPoint: checkoutUrl, preferenceId },
        { status: 201 }
      );
    } catch (prefError) {
      await prisma.appointment.delete({ where: { id: appointment.id } });
      console.error("Error creating MP preference:", prefError);
      return NextResponse.json(
        { error: "Could not start payment in Mercado Pago. Please try again." },
        { status: 502 }
      );
    }
  } catch (error) {
    if (error instanceof GuestUserError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof SlotBookingError) {
      const status = error.code === "SLOT_UNAVAILABLE" ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    if (error instanceof Error && error.message === "SLOT_FULL") {
      return NextResponse.json(
        { error: "This time slot is fully booked. Please choose another time." },
        { status: 409 }
      );
    }
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
