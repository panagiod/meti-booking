import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List public advisors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const minRating = searchParams.get("minRating");

    const where: any = {
      isActive: true,
      isHidden: false,
    };

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { speciality: { contains: search, mode: "insensitive" } },
        { categories: { some: { category: { name: { contains: search, mode: "insensitive" } } } } },
      ];
    }

    if (category) {
      where.categories = {
        some: { category: { slug: category } },
      };
    }

    const advisors = await prisma.advisorProfile.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
        categories: {
          include: { category: true },
        },
        services: {
          where: { isActive: true },
          select: { priceCents: true },
          orderBy: { priceCents: "asc" },
          take: 1,
        },
        _count: {
          select: {
            appointments: { where: { status: "COMPLETED" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get reviews for each advisor
    const advisorIds = advisors.map((a: any) => a.id);
    const reviews = await prisma.review.groupBy({
      by: ["appointmentId"],
      where: {
        appointment: { advisorId: { in: advisorIds } },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Map reviews to advisors
    const reviewMap = new Map<string, { avg: number; count: number }>();
    for (const review of reviews) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: review.appointmentId },
        select: { advisorId: true },
      });
      if (appointment) {
        const existing = reviewMap.get(appointment.advisorId) || { avg: 0, count: 0 };
        reviewMap.set(appointment.advisorId, {
          avg: existing.avg + (review._avg.rating || 0),
          count: existing.count + (review._count.rating || 0),
        });
      }
    }

    // Format response
    const formattedAdvisors = advisors.map((advisor: any) => {
      const reviewData = reviewMap.get(advisor.id) || { avg: 0, count: 0 };
      const avgRating = reviewData.count > 0 ? reviewData.avg / reviewData.count : 0;

      return {
        id: advisor.id,
        name: advisor.user.name,
        image: advisor.user.image,
        speciality: advisor.speciality,
        bio: advisor.bio,
        isVerified: advisor.isVerified,
        mpMode: advisor.mpMode,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviewData.count,
        minPrice: advisor.services[0]?.priceCents || 0,
        minPriceWithFee: Math.round((advisor.services[0]?.priceCents || 0) * 1.15),
        categories: advisor.categories.map((ac: any) => ac.category.name),
        appointmentCount: advisor._count.appointments,
      };
    });

    // Filter by rating if specified
    const filteredAdvisors = minRating
      ? formattedAdvisors.filter((a: any) => a.rating >= Number(minRating))
      : formattedAdvisors;

    return NextResponse.json({ advisors: filteredAdvisors });
  } catch (error) {
    console.error("Error fetching public advisors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
