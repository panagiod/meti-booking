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

    const userWithRole = session.user as any;
    if (userWithRole.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalAdvisors,
      activeAdvisors,
      pendingAdvisors,
      totalUsers,
      todayAppointments,
      completedToday,
      monthAppointments,
    ] = await Promise.all([
      prisma.advisorProfile.count(),
      prisma.advisorProfile.count({ where: { isActive: true } }),
      prisma.advisorProfile.count({ where: { isActive: false } }),
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
      prisma.appointment.findMany({
        where: {
          createdAt: { gte: startOfMonth },
          status: "COMPLETED",
        },
        select: { platformFee: true, advisorEarning: true, totalCents: true },
      }),
    ]);

    const monthRevenue = monthAppointments.reduce(
      (sum: number, apt: any) => sum + apt.totalCents,
      0
    );
    const monthFees = monthAppointments.reduce(
      (sum: number, apt: any) => sum + apt.platformFee,
      0
    );

    // Get recent advisors
    const recentAdvisors = await prisma.advisorProfile.findMany({
      include: {
        user: {
          select: { name: true, email: true, image: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        activeAdvisors,
        pendingAdvisors,
        totalUsers,
        monthRevenue,
        monthFees,
        todayAppointments,
        completedToday,
      },
      recentAdvisors: recentAdvisors.map((a: any) => ({
        id: a.id,
        name: a.user.name,
        email: a.user.email,
        speciality: a.speciality || "Unspecified",
        status: a.isActive ? "active" : "pending",
        joinDate: a.user.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
