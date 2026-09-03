import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { resolveStudioInstructor } from "@/lib/studio-instructor";
import { mergeScheduleFromDb } from "@/lib/studio-schedule";
import { getStudioContent } from "@/lib/studio-content-server";
import { siteConfig, REFORMER_SERVICE_NAME } from "@/lib/site-config";

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

    const [schedules, blockedTimes, service, content] = await Promise.all([
      prisma.instructorSchedule.findMany({
        where: { instructorId: advisor.id },
        orderBy: { dayOfWeek: "asc" },
      }),
      prisma.blockedTime.findMany({
        where: { instructorId: advisor.id },
        orderBy: { startDate: "asc" },
      }),
      prisma.instructorService.findFirst({
        where: { instructorId: advisor.id, isActive: true },
        orderBy: { createdAt: "asc" },
        select: { durationMin: true, name: true },
      }),
      getStudioContent(),
    ]);

    return NextResponse.json({
      studio: {
        name: content.name,
        instructorId: advisor.id,
        instructorName: advisor.user.name,
        instructorEmail: advisor.user.email,
        slotCapacity: siteConfig.slotCapacity,
        serviceDurationMin: service?.durationMin ?? 50,
        serviceName: service?.name ?? REFORMER_SERVICE_NAME,
        schedules: mergeScheduleFromDb(schedules),
        blockedTimes,
      },
    });
  } catch (error) {
    console.error("[admin/studio] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
