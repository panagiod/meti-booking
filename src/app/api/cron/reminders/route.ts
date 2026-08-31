import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAppointmentReminder } from "@/lib/notify";
import { requireCronAuth } from "@/lib/cron-auth";

export async function GET(request: Request) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Confirmed appointments starting between 22h and 26h from now
    // (wide window to cover the exact daily cron run)
    const startWindow = new Date(now.getTime() + 22 * 60 * 60 * 1000);
    const endWindow = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    const upcoming = await prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        scheduledAt: { gte: startWindow, lte: endWindow },
        // Avoid re-sending if already notified (marker on the appointment)
        reminderSentAt: null,
      },
      select: { id: true },
    });

    let sent = 0;
    for (const apt of upcoming) {
      try {
        const ok = await notifyAppointmentReminder(apt.id);
        if (ok) {
          await prisma.appointment.update({
            where: { id: apt.id },
            data: { reminderSentAt: new Date() },
          });
          sent++;
        }
      } catch (e) {
        console.error(`Error sending reminder for ${apt.id}:`, e);
      }
    }

    return NextResponse.json({ ok: true, processed: upcoming.length, sent });
  } catch (error) {
    console.error("Cron reminder error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
