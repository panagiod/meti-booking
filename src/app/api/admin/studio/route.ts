import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { resolveStudioAdvisor } from "@/lib/studio-advisor";
import { mergeScheduleFromDb } from "@/lib/studio-schedule";
import { siteConfig, REFORMER_SERVICE_NAME } from "@/lib/site-config";

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

    const [schedules, blockedTimes, service] = await Promise.all([
      prisma.advisorSchedule.findMany({
        where: { advisorId: advisor.id },
        orderBy: { dayOfWeek: "asc" },
      }),
      prisma.blockedTime.findMany({
        where: { advisorId: advisor.id },
        orderBy: { startDate: "asc" },
      }),
      prisma.advisorService.findFirst({
        where: { advisorId: advisor.id, isActive: true },
        orderBy: { createdAt: "asc" },
        select: { durationMin: true, name: true },
      }),
    ]);

    return NextResponse.json({
      studio: {
        name: siteConfig.name,
        advisorId: advisor.id,
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
