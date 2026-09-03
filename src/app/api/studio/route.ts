import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveStudioInstructor } from "@/lib/studio-instructor";
import { getStudioContent } from "@/lib/studio-content-server";
import { getDemoStudioResponse, isDemoBookingMode } from "@/lib/studio-demo-fallback";
import { isPaymentsEnabled } from "@/lib/payments-config";
import { isReformerService } from "@/lib/site-config";
import { resolveBookingLeadHours } from "@/lib/booking-config";
import { instructorMpConnected } from "@/lib/instructor-mp";

export const dynamic = "force-dynamic";

function mapStudioPayload(params: {
  instructorId: string;
  studioName: string;
  instructorName: string;
  image?: string | null;
  bookingLeadHours: number;
  mpConnected: boolean;
  mpMode: string | null;
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    durationMin: number;
    priceCents: number;
    rescheduleHoursMin: number;
    promotions?: Array<{
      id: string;
      name: string;
      discountType: string;
      discountValue: number;
    }>;
  }>;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    lunchStart: string | null;
    lunchEnd: string | null;
    gapMinutes: number;
  }>;
}) {
  return {
    instructorId: params.instructorId,
    name: params.studioName,
    instructorName: params.instructorName,
    image: params.image ?? null,
    bookingLeadHours: params.bookingLeadHours,
    mpConnected: params.mpConnected,
    mpMode: params.mpMode,
    services: params.services
      .filter((service) => isReformerService(service.name))
      .map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        durationMin: service.durationMin,
        priceCents: service.priceCents,
        rescheduleHoursMin: service.rescheduleHoursMin,
        promotion: service.promotions?.[0] || null,
      })),
    schedule: params.schedule.map((row) => ({
      dayOfWeek: row.dayOfWeek,
      startTime: row.startTime,
      endTime: row.endTime,
      lunchStart: row.lunchStart,
      lunchEnd: row.lunchEnd,
      gapMinutes: row.gapMinutes,
    })),
  };
}

/**
 * Returns the studio instructor, reformer services, and weekly schedule for /book.
 */
export async function GET() {
  if (isDemoBookingMode()) {
    return NextResponse.json({
      ...getDemoStudioResponse(),
      paymentsEnabled: isPaymentsEnabled(),
    });
  }

  try {
    const [instructor, content] = await Promise.all([
      resolveStudioInstructor(),
      getStudioContent(),
    ]);

    if (!instructor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const profile = await prisma.instructorProfile.findUnique({
      where: { id: instructor.id },
      include: {
        user: { select: { name: true, image: true } },
        services: {
          where: { isActive: true },
          orderBy: { priceCents: "asc" },
          include: {
            promotions: {
              where: {
                isActive: true,
                startAt: { lte: new Date() },
                endAt: { gte: new Date() },
              },
              select: { id: true, name: true, discountType: true, discountValue: true },
            },
          },
        },
        schedule: {
          where: { isActive: true },
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    return NextResponse.json({
      studio: mapStudioPayload({
        instructorId: profile.id,
        studioName: content.name,
        instructorName: profile.user.name,
        image: profile.user.image,
        bookingLeadHours: resolveBookingLeadHours(profile.bookingLeadHours),
        mpConnected: instructorMpConnected(profile),
        mpMode: profile.mpMode,
        services: profile.services,
        schedule: profile.schedule,
      }),
      paymentsEnabled: isPaymentsEnabled(),
    });
  } catch (error) {
    console.error("[studio] GET error:", error);
    if (isDemoBookingMode()) {
      return NextResponse.json({
        ...getDemoStudioResponse(),
        paymentsEnabled: isPaymentsEnabled(),
      });
    }
    return NextResponse.json({ error: "Failed to load studio" }, { status: 500 });
  }
}
