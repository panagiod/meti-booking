import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { createCheckoutPreference } from "@/lib/mercadopago";
import { parseLocalISO } from "@/lib/timezone";
import { buildBookingQuote } from "@/lib/booking-quote";
import { siteConfig } from "@/lib/site-config";
import { validateBookableSlot, SlotBookingError } from "@/lib/slot-booking";
import { decryptMpAccessToken } from "@/lib/instructor-mp";
import { findOrCreateGuestUser, GuestUserError } from "@/lib/guest-user";
import { isPaymentsEnabled } from "@/lib/payments-config";
import { notifyAppointmentConfirmed } from "@/lib/notify";
import { isSqliteDatabase } from "@/lib/database-provider";
import { readInstructorId } from "@/lib/studio-instructor";
import {
  createDemoAppointment,
  isDemoInstructorId,
  isDemoBookingMode,
  isDemoServiceId,
  validateDemoBookableSlot,
} from "@/lib/studio-demo-fallback";
import { randomUUID } from "crypto";
import {
  assertBookingRateLimit,
  clientIpFromRequest,
} from "@/lib/booking-rate-limit";
import { attachGuestSession } from "@/lib/guest-session";
import { createManageToken } from "@/lib/booking-manage-token";
import { getSiteUrl } from "@/lib/site-config";

const appointmentSchema = z.object({
  instructorId: z.string().optional(),
  advisorId: z.string().optional(),
  serviceId: z.string(),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/),
  promotionId: z.string().nullable().optional(),
  guestEmail: z.string().email().optional(),
  guestName: z.string().trim().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    const body = await request.json();
    const parsed = appointmentSchema.parse(body);
    const instructorId = readInstructorId(parsed);
    const { serviceId, scheduledAt, promotionId, guestEmail, guestName } = parsed;
    const paymentsEnabled = isPaymentsEnabled();

    if (!instructorId) {
      return NextResponse.json({ error: "instructorId is required" }, { status: 400 });
    }

    if (isDemoBookingMode() && isDemoInstructorId(instructorId) && isDemoServiceId(serviceId)) {
      const parsedDate = parseLocalISO(scheduledAt);
      if (!parsedDate) {
        return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
      }

      try {
        validateDemoBookableSlot(parsedDate);
      } catch (error) {
        if (error instanceof SlotBookingError) {
          const status = error.code === "SLOT_UNAVAILABLE" ? 409 : 400;
          return NextResponse.json({ error: error.message }, { status });
        }
        throw error;
      }

      if (!session && !guestEmail) {
        return NextResponse.json(
          { error: "Email is required to complete your booking" },
          { status: 401 }
        );
      }

      if (paymentsEnabled) {
        return NextResponse.json(
          {
            error:
              "Online payment requires a database connection. Set DATABASE_URL or disable PAYMENTS_ENABLED.",
          },
          { status: 503 }
        );
      }

      const appointment = createDemoAppointment({
        clientId: session?.user.id ?? randomUUID(),
        scheduledAt: parsedDate,
      });

      return NextResponse.json({ appointment, paymentsEnabled: false }, { status: 201 });
    }

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

    const rateLimit = await assertBookingRateLimit({
      ip: clientIpFromRequest(request),
      email: payerEmail,
      clientId,
    });
    if (!rateLimit.ok) {
      return NextResponse.json({ error: rateLimit.error }, { status: 429 });
    }

    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { id: instructorId },
    });

    if (!instructorProfile) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    if (paymentsEnabled && !instructorProfile.mpAccessToken) {
      return NextResponse.json(
        { error: "Instructor has no Mercado Pago account configured" },
        { status: 400 }
      );
    }

    const service = await prisma.instructorService.findUnique({
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

    const quote = buildBookingQuote({
      serviceId: service.id,
      serviceName: service.name,
      servicePriceCents: service.priceCents,
      feePercentage,
      maxFeeCents,
      discountCents,
    });
    const { instructorEarningCents: instructorEarning, platformFeeCents: platformFee, totalCents } = quote;

    const parsedDate = parseLocalISO(scheduledAt);
    if (!parsedDate) {
      return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
    }

    await validateBookableSlot({
      instructorId,
      serviceId,
      scheduledAt: parsedDate,
    });

    const mpToken = paymentsEnabled
      ? decryptMpAccessToken(instructorProfile.mpAccessToken)
      : null;
    if (paymentsEnabled && !mpToken) {
      return NextResponse.json(
        { error: "Instructor payment credentials are not configured" },
        { status: 400 }
      );
    }

    const isTest = paymentsEnabled && instructorProfile.mpMode === "TEST";

    function manageUrlFor(appointmentId: string, email: string): string | undefined {
      try {
        const token = createManageToken(appointmentId, email);
        return `${getSiteUrl()}/booking/manage?t=${encodeURIComponent(token)}`;
      } catch (error) {
        console.error("Could not create booking manage token:", error);
        return undefined;
      }
    }

    async function withGuestSession(response: NextResponse) {
      if (session) return response;
      try {
        await attachGuestSession(response, clientId, request);
      } catch (error) {
        console.error("Could not create guest session:", error);
      }
      return response;
    }

    const appointment = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const bookedCount = await tx.appointment.count({
          where: {
            instructorId: instructorProfile.id,
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
            instructorId: instructorProfile.id,
            serviceId: serviceId,
            scheduledAt: parsedDate,
            durationMin: service.durationMin,
            status: paymentsEnabled ? "PENDING" : "CONFIRMED",
            totalCents,
            instructorEarning,
            platformFee,
            discountCents,
            isTest,
          },
        });
      },
      isSqliteDatabase()
        ? undefined
        : { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    const manageUrl = manageUrlFor(appointment.id, payerEmail);

    if (!paymentsEnabled) {
      try {
        await notifyAppointmentConfirmed(appointment.id);
      } catch (notifyError) {
        console.error("Error sending confirmation emails:", notifyError);
      }

      return withGuestSession(
        NextResponse.json(
          { appointment, paymentsEnabled: false, manageUrl },
          { status: 201 }
        )
      );
    }

    try {
      const { preferenceId, initPoint, sandboxInitPoint } =
        await createCheckoutPreference({
          accessToken: mpToken!,
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

      return withGuestSession(
        NextResponse.json(
          { appointment, initPoint: checkoutUrl, preferenceId, paymentsEnabled: true, manageUrl },
          { status: 201 }
        )
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
