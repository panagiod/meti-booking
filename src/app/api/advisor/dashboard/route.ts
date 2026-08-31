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

    if (userWithRole.role !== "ADVISOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get advisor profile
    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor profile not found" }, { status: 404 });
    }

    // Get stats
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [servicesCount, weekAppointments, monthPayments] = await Promise.all([
      prisma.advisorService.count({
        where: { advisorId: advisorProfile.id, isActive: true },
      }),
      prisma.appointment.count({
        where: {
          advisorId: advisorProfile.id,
          scheduledAt: { gte: startOfWeek },
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        },
      }),
      prisma.appointment.findMany({
        where: {
          advisorId: advisorProfile.id,
          status: "COMPLETED",
          createdAt: { gte: startOfMonth },
        },
        select: { advisorEarning: true },
      }),
    ]);

    const monthEarnings = monthPayments.reduce(
      (sum: number, apt: any) => sum + apt.advisorEarning,
      0
    );

    // Get upcoming appointments (next 5)
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        advisorId: advisorProfile.id,
        scheduledAt: { gte: now },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      include: {
        client: { select: { name: true } },
        service: { select: { name: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    });

    // Citas confirmadas recientes (para notificaciones de nuevas reservas)
    // Solo citas futuras o de hoy
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        advisorId: advisorProfile.id,
        status: "CONFIRMED",
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        scheduledAt: { gte: startOfToday },
      },
      include: {
        client: { select: { name: true } },
        service: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        weekAppointments,
        servicesCount,
        monthEarnings,
        rating: 0,
      },
      upcomingAppointments: upcomingAppointments.map((apt: any) => ({
        id: apt.id,
        clientName: apt.client.name,
        serviceName: apt.service.name,
        scheduledAt: apt.scheduledAt.toISOString(),
        duration: apt.durationMin,
      })),
      recentAppointments: recentAppointments.map((apt: any) => ({
        id: apt.id,
        clientName: apt.client.name,
        serviceName: apt.service.name,
        scheduledAt: apt.scheduledAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching advisor dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
