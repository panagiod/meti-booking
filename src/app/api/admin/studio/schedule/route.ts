import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { resolveStudioAdvisor } from "@/lib/studio-advisor";
import { mergeScheduleFromDb, validateStudioSchedule } from "@/lib/studio-schedule";
import { schedulePayloadSchema } from "@/lib/schedule-schema";
import { z } from "zod";

export async function GET() {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const advisor = await resolveStudioAdvisor();
    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const schedules = await prisma.advisorSchedule.findMany({
      where: { advisorId: advisor.id },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({
      advisorId: advisor.id,
      schedules: mergeScheduleFromDb(schedules),
    });
  } catch (error) {
    console.error("[admin/studio/schedule] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const advisor = await resolveStudioAdvisor();
    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const body = await request.json();
    const { schedules } = schedulePayloadSchema.parse(body);

    const validationError = validateStudioSchedule(schedules);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await prisma.advisorSchedule.deleteMany({
      where: { advisorId: advisor.id },
    });

    const createdSchedules = await Promise.all(
      schedules
        .filter((s) => s.isActive)
        .map((s) =>
          prisma.advisorSchedule.create({
            data: {
              advisorId: advisor.id,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              lunchStart: s.lunchStart || null,
              lunchEnd: s.lunchEnd || null,
              gapMinutes: s.gapMinutes,
              isActive: true,
            },
          })
        )
    );

    return NextResponse.json({
      schedules: mergeScheduleFromDb(createdSchedules),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("[admin/studio/schedule] PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
