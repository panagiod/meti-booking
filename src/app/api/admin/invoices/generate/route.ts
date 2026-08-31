import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APP_TIMEZONE_OFFSET_HOURS } from "@/lib/timezone";

// POST: Generar (o regenerar) facturas del mes para todos los asesores
// Body: { month: "YYYY-MM" } — si no se envía, usa el mes actual
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const monthParam = (body.month as string) || new Date().toISOString().slice(0, 7);

    // Rango del mes en timezone de la app (Colombia UTC-5)
    const [y, m] = monthParam.split("-").map(Number);
    const periodStart = new Date(Date.UTC(y, m - 1, 1, -APP_TIMEZONE_OFFSET_HOURS, 0, 0, 0));
    const periodEnd = new Date(Date.UTC(y, m, 0, 23 - APP_TIMEZONE_OFFSET_HOURS, 59, 59, 999));

    // Citas facturables (pagadas) del período, agrupadas por asesor
    const appointments = await prisma.appointment.findMany({
      where: {
        status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
        scheduledAt: { gte: periodStart, lte: periodEnd },
      },
      select: {
        advisorId: true,
        platformFee: true,
        advisorEarning: true,
      },
    });

    // Agrupar por asesor
    const byAdvisor = new Map<string, { fee: number; earnings: number; count: number }>();
    for (const apt of appointments) {
      const entry = byAdvisor.get(apt.advisorId) || { fee: 0, earnings: 0, count: 0 };
      entry.fee += apt.platformFee;
      entry.earnings += apt.advisorEarning;
      entry.count++;
      byAdvisor.set(apt.advisorId, entry);
    }

    let created = 0;
    let updated = 0;

    // Upsert factura por asesor (evita duplicados)
    for (const [advisorId, totals] of byAdvisor) {
      const existing = await prisma.invoice.findUnique({
        where: { advisorId_periodStart_periodEnd: { advisorId, periodStart, periodEnd } },
      });

      if (existing) {
        await prisma.invoice.update({
          where: { id: existing.id },
          data: {
            totalFeeCents: totals.fee,
            totalEarningsCents: totals.earnings,
            appointmentCount: totals.count,
          },
        });
        updated++;
      } else {
        await prisma.invoice.create({
          data: {
            advisorId,
            periodStart,
            periodEnd,
            totalFeeCents: totals.fee,
            totalEarningsCents: totals.earnings,
            appointmentCount: totals.count,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      ok: true,
      month: monthParam,
      advisorsInvoiced: byAdvisor.size,
      created,
      updated,
      totalAppointments: appointments.length,
    });
  } catch (error) {
    console.error("Error generating invoices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
