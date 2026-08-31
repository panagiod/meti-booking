import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const promotionSchema = z.object({
  serviceId: z.string(),
  name: z.string().min(1, "El nombre es requerido"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0.01),
  startAt: z.string(),
  endAt: z.string(),
});

// GET: List promotions for the advisor
export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const advisorProfile = await prisma.advisorProfile.findUnique({ where: { userId: session.user.id } });
    if (!advisorProfile) return NextResponse.json({ error: "Advisor not found" }, { status: 404 });

    const promotions = await prisma.promotion.findMany({
      where: { advisorId: advisorProfile.id },
      include: { service: { select: { id: true, name: true, priceCents: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create promotion
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const advisorProfile = await prisma.advisorProfile.findUnique({ where: { userId: session.user.id } });
    if (!advisorProfile) return NextResponse.json({ error: "Advisor not found" }, { status: 404 });

    const body = await request.json();
    const data = promotionSchema.parse(body);

    if (new Date(data.endAt) <= new Date(data.startAt)) {
      return NextResponse.json({ error: "La fecha de fin debe ser posterior a la fecha de inicio" }, { status: 400 });
    }

    // Validate discount value
    if (data.discountType === "percentage" && (data.discountValue < 0.01 || data.discountValue > 100)) {
      return NextResponse.json({ error: "El porcentaje debe estar entre 0.01 y 100" }, { status: 400 });
    }

    // Verify the service belongs to this advisor
    const service = await prisma.advisorService.findFirst({ where: { id: data.serviceId, advisorId: advisorProfile.id } });
    if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });

    const promotion = await prisma.promotion.create({
      data: {
        advisorId: advisorProfile.id,
        serviceId: data.serviceId,
        name: data.name,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
      },
    });

    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.format() }, { status: 400 });
    }
    console.error("Error creating promotion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
