import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalUsers, todayAppointments, completedToday] = await Promise.all([
      prisma.user.count(),
      prisma.appointment.count({
        where: {
          scheduledAt: { gte: startOfDay },
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        },
      }),
      prisma.appointment.count({
        where: {
          scheduledAt: { gte: startOfDay },
          status: "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        todayAppointments,
        completedToday,
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
