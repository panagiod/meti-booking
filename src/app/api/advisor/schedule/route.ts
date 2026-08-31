import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { validateStudioSchedule } from "@/lib/studio-schedule";

const scheduleSchema = z.object({
  schedules: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      isActive: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      lunchStart: z.string().optional().nullable(),
      lunchEnd: z.string().optional().nullable(),
      gapMinutes: z.number().min(0).max(120).default(15),
    })
  ),
});

// GET: Get schedule
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

    const schedules = await prisma.advisorSchedule.findMany({
      where: { advisorId: advisorProfile.id },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update schedule
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
    const { schedules } = scheduleSchema.parse(body);

    const validationError = validateStudioSchedule(schedules);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Delete existing schedules and recreate
    await prisma.advisorSchedule.deleteMany({
      where: { advisorId: advisorProfile.id },
    });

    // Create new schedules
    const createdSchedules = await Promise.all(
      schedules
        .filter((s) => s.isActive)
        .map((s) =>
          prisma.advisorSchedule.create({
            data: {
              advisorId: advisorProfile.id,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              lunchStart: s.lunchStart || null,
              lunchEnd: s.lunchEnd || null,
              gapMinutes: s.gapMinutes,
              isActive: s.isActive,
            },
          })
        )
    );

    return NextResponse.json({ schedules: createdSchedules });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
