import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Active promotion for a service (public endpoint)
// Used when creating an appointment to apply a discount.
// Query params: ?serviceId=xxx&advisorId=yyy
export async function GET(request: NextRequest) {
  try {
    const serviceId = request.nextUrl.searchParams.get("serviceId");
    if (!serviceId) {
      return NextResponse.json({ error: "serviceId is required" }, { status: 400 });
    }

    const now = new Date();

    const promotion = await prisma.promotion.findFirst({
      where: {
        serviceId,
        isActive: true,
        startAt: { lte: now },
        endAt: { gte: now },
      },
      select: {
        id: true,
        name: true,
        discountType: true,
        discountValue: true,
        endAt: true,
      },
      orderBy: { discountValue: "desc" }, // Highest discount first
    });

    return NextResponse.json({ promotion: promotion || null });
  } catch (error) {
    console.error("Error fetching promotion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
