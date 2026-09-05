import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { studioDateStrFromUtc, studioDayBoundsUTC } from "@/lib/timezone";

export async function GET() {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const now = new Date();
    const { start: startOfDay, end: endOfDay } = studioDayBoundsUTC(studioDateStrFromUtc(now));

    const [totalUsers, todayAppointments, completedToday, upcomingAppointments] = await Promise.all([
      prisma.user.count(),
      prisma.appointment.count({
        where: {
          scheduledAt: { gte: startOfDay, lte: endOfDay },
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        },
      }),
      prisma.appointment.count({
        where: {
          scheduledAt: { gte: startOfDay, lte: endOfDay },
          status: "COMPLETED",
        },
      }),
      prisma.appointment.count({
        where: {
          scheduledAt: { gte: now },
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        todayAppointments,
        completedToday,
        upcomingAppointments,
      },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
