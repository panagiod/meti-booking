import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePrices } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const serviceId = request.nextUrl.searchParams.get("serviceId");
    const promotionId = request.nextUrl.searchParams.get("promotionId");

    if (!serviceId) {
      return NextResponse.json({ error: "serviceId is required" }, { status: 400 });
    }

    const service = await prisma.advisorService.findUnique({
      where: { id: serviceId },
      include: {
        category: {
          select: { feePercentage: true, maxFeeCents: true },
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

    if (!service || !service.isActive) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    let feePercentage = 15;
    let maxFeeCents: number | null = null;
    if (service.category) {
      feePercentage = service.category.feePercentage;
      maxFeeCents = service.category.maxFeeCents;
    }

    let discountCents = 0;
    let promotion: {
      id: string;
      name: string;
      discountType: string;
      discountValue: number;
    } | null = null;

    const activePromotion = promotionId ? service.promotions?.[0] : undefined;
    if (activePromotion) {
      promotion = {
        id: activePromotion.id,
        name: activePromotion.name,
        discountType: activePromotion.discountType,
        discountValue: activePromotion.discountValue,
      };
      discountCents =
        activePromotion.discountType === "percentage"
          ? Math.round(service.priceCents * (activePromotion.discountValue / 100))
          : activePromotion.discountValue;
      discountCents = Math.min(discountCents, service.priceCents);
    }

    const { advisorEarning, platformFee, totalCents } = calculatePrices({
      servicePriceCents: service.priceCents,
      feePercentage,
      maxFeeCents,
      discountCents,
    });

    return NextResponse.json({
      quote: {
        serviceId: service.id,
        serviceName: service.name,
        servicePriceCents: service.priceCents,
        discountCents,
        platformFeeCents: platformFee,
        advisorEarningCents: advisorEarning,
        totalCents,
        feePercentage,
        promotion,
      },
    });
  } catch (error) {
    console.error("[checkout/quote] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
