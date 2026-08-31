import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  durationMin: z.number().min(15, "Minimum 15 minutes").max(480, "Maximum 8 hours"),
  priceCents: z.number().min(10000, "Minimum price $100"),
  rescheduleHoursMin: z.number().min(0).max(168).default(24),
});

// GET: List services
export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor profile not found" }, { status: 404 });
    }

    const services = await prisma.advisorService.findMany({
      where: { advisorId: advisorProfile.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            feePercentage: true,
            minimumPriceCents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ services, isActive: advisorProfile.isActive });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create service
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor profile not found" }, { status: 404 });
    }

    if (!advisorProfile.isActive) {
      return NextResponse.json(
        { error: "You cannot create services until approved by a system administrator." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = serviceSchema.parse(body);

    const service = await prisma.advisorService.create({
      data: {
        advisorId: advisorProfile.id,
        name: validatedData.name,
        description: validatedData.description,
        categoryId: validatedData.categoryId || null,
        durationMin: validatedData.durationMin,
        priceCents: validatedData.priceCents,
        rescheduleHoursMin: validatedData.rescheduleHoursMin,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update service
export async function PUT(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Service ID required" }, { status: 400 });
    }

    const existingService = await prisma.advisorService.findFirst({
      where: { id, advisorId: advisorProfile.id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const service = await prisma.advisorService.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete service
export async function DELETE(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Service ID required" }, { status: 400 });
    }

    const existingService = await prisma.advisorService.findFirst({
      where: { id, advisorId: advisorProfile.id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await prisma.advisorService.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
