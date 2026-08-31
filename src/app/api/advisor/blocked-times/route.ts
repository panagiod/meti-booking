import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const blockedTimeSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isAllDay: z.boolean().default(true),
  reason: z.string().optional(),
});

// GET: List blocked times
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

    const blockedTimes = await prisma.blockedTime.findMany({
      where: { advisorId: advisorProfile.id },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ blockedTimes });
  } catch (error) {
    console.error("Error fetching blocked times:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create blocked time
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

    const body = await request.json();
    const validatedData = blockedTimeSchema.parse(body);

    // Validate dates
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
        { status: 400 }
      );
    }

    // Check for overlapping blocked times
    const overlapping = await prisma.blockedTime.findFirst({
      where: {
        advisorId: advisorProfile.id,
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "Ya existe un bloqueo en ese horario" },
        { status: 400 }
      );
    }

    const blockedTime = await prisma.blockedTime.create({
      data: {
        advisorId: advisorProfile.id,
        title: validatedData.title,
        startDate,
        endDate,
        isAllDay: validatedData.isAllDay,
        reason: validatedData.reason,
      },
    });

    return NextResponse.json({ blockedTime }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error creating blocked time:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete blocked time
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
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Verify it belongs to this advisor
    const blockedTime = await prisma.blockedTime.findFirst({
      where: { id, advisorId: advisorProfile.id },
    });

    if (!blockedTime) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.blockedTime.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blocked time:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
