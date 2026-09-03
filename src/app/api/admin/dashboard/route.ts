import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWithRole = session.user as { role?: string };
    if (userWithRole.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
