import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { resolveStudioInstructor } from "@/lib/studio-instructor";
import { mergeScheduleFromDb, validateStudioSchedule, formatScheduleHoursForLocale } from "@/lib/studio-schedule";
import { schedulePayloadSchema } from "@/lib/schedule-schema";
import { getStudioContent, saveStudioContent } from "@/lib/studio-content-server";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const advisor = await resolveStudioInstructor();
    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const schedules = await prisma.instructorSchedule.findMany({
      where: { instructorId: advisor.id },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({
      instructorId: advisor.id,
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

    const advisor = await resolveStudioInstructor();
    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const body = await request.json();
    const { schedules } = schedulePayloadSchema.parse(body);

    const validationError = validateStudioSchedule(schedules);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await prisma.instructorSchedule.deleteMany({
      where: { instructorId: advisor.id },
    });

    const createdSchedules = await Promise.all(
      schedules
        .filter((s) => s.isActive)
        .map((s) =>
          prisma.instructorSchedule.create({
            data: {
              instructorId: advisor.id,
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

    const mergedSchedules = mergeScheduleFromDb(createdSchedules);

    const content = await getStudioContent();
    await saveStudioContent({
      ...content,
      contentEn: {
        ...content.contentEn,
        common: {
          ...content.contentEn.common,
          hours: formatScheduleHoursForLocale(mergedSchedules, "en"),
        },
      },
      contentEl: {
        ...content.contentEl,
        common: {
          ...content.contentEl.common,
          hours: formatScheduleHoursForLocale(mergedSchedules, "el"),
        },
      },
    });

    return NextResponse.json({
      schedules: mergedSchedules,
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
