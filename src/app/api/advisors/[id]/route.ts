import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isReformerService } from "@/lib/site-config";
import { resolveBookingLeadHours } from "@/lib/booking-config";

// GET: Get advisor details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const advisor = await prisma.advisorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, image: true },
        },
        categories: {
          include: { category: true },
        },
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

    if (!advisor) {
      return NextResponse.json({ error: "Advisor not found" }, { status: 404 });
    }

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: {
        appointment: { advisorId: advisor.id },
      },
      select: { rating: true },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      advisor: {
        id: advisor.id,
        name: advisor.user.name,
        image: advisor.user.image,
        speciality: advisor.speciality,
        bio: advisor.bio,
        videoUrl: advisor.videoUrl,
        isVerified: advisor.isVerified,
        mpMode: advisor.mpMode,
        bookingLeadHours: resolveBookingLeadHours(advisor.bookingLeadHours),
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
        categories: advisor.categories.map((ac: any) => ac.category.name),
        services: advisor.services
          .filter((s: { name: string }) => isReformerService(s.name))
          .map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          durationMin: s.durationMin,
          priceCents: s.priceCents,
          rescheduleHoursMin: s.rescheduleHoursMin,
          promotion: s.promotions?.[0] || null,
        })),
        schedule: advisor.schedule.map((s: any) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          lunchStart: s.lunchStart,
          lunchEnd: s.lunchEnd,
          gapMinutes: s.gapMinutes,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching advisor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
