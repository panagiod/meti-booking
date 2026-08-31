import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APP_TIMEZONE_OFFSET_HOURS } from "@/lib/timezone";

// GET: Facturas del asesor logueado + resumen del mes actual
export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    if (user.role !== "ADVISOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const advisorProfile = await prisma.advisorProfile.findUnique({ where: { userId: session.user.id } });
    if (!advisorProfile) return NextResponse.json({ error: "Advisor not found" }, { status: 404 });

    // Facturas del asesor
    const invoices = await prisma.invoice.findMany({
      where: { advisorId: advisorProfile.id },
      orderBy: { periodStart: "desc" },
    });

    // Resumen del mes actual: acumulado de fee + earnings
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, -APP_TIMEZONE_OFFSET_HOURS, 0, 0, 0));

    const currentMonth = await prisma.appointment.aggregate({
      where: {
        advisorId: advisorProfile.id,
        status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
        scheduledAt: { gte: monthStart },
      },
      _sum: { platformFee: true, advisorEarning: true },
      _count: true,
    });

    return NextResponse.json({
      invoices: invoices.map((inv: any) => ({
        id: inv.id,
        periodStart: inv.periodStart.toISOString(),
        periodEnd: inv.periodEnd.toISOString(),
        totalFeeCents: inv.totalFeeCents,
        totalEarningsCents: inv.totalEarningsCents,
        appointmentCount: inv.appointmentCount,
        status: inv.status,
        paidAt: inv.paidAt?.toISOString() || null,
      })),
      currentMonth: {
        feesCents: currentMonth._sum.platformFee || 0,
        earningsCents: currentMonth._sum.advisorEarning || 0,
        appointmentCount: currentMonth._count,
      },
    });
  } catch (error) {
    console.error("Error fetching advisor invoices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
