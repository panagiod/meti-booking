import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCronAuth } from "@/lib/cron-auth";

// Cron: Daily cleanup of expired PENDING appointments (safety net).
export async function GET(request: Request) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const now = new Date();
    const expiryThreshold = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes ago

    // Find all PENDING appointments older than 15 minutes
    const expiredAppointments = await prisma.appointment.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: expiryThreshold },
      },
      select: { id: true },
    });

    if (expiredAppointments.length === 0) {
      return NextResponse.json({ ok: true, expired: 0 });
    }

    // Cancel all expired appointments in a single update
    const result = await prisma.appointment.updateMany({
      where: {
        id: { in: expiredAppointments.map((apt: { id: string }) => apt.id) },
        status: "PENDING", // Double-check to avoid race conditions
      },
      data: {
        status: "CANCELLED",
        cancelReason: "Payment not completed - expired after 15 minutes",
        cancelledAt: now,
      },
    });

    console.log(`[cron/expire-pending] Expired ${result.count} pending appointments`);

    return NextResponse.json({
      ok: true,
      expired: result.count,
      appointmentIds: expiredAppointments.map((apt: { id: string }) => apt.id),
    });
  } catch (error) {
    console.error("Cron expire-pending error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
