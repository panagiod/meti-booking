import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cron: Daily cleanup of expired PENDING appointments
// Runs once daily via Vercel cron (Hobby plan limitation).
// Primary expiration happens on-demand in /api/slots when users query availability.
// This cron is a safety net to catch any stale records.
export async function GET(request: Request) {
  // Protect with cron secret (Vercel injects it in the header)
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
        cancelReason: "Pago no completado - expirado después de 15 minutos",
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
