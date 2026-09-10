import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCronAuth } from "@/lib/cron-auth";
import { deleteExpiredCompletedAppointments } from "@/lib/appointment-complete-server";

export async function GET(request: Request) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const cancelled = await prisma.appointment.deleteMany({
      where: { status: "CANCELLED" },
    });
    const expired = await deleteExpiredCompletedAppointments();

    console.log(
      `[cron/cleanup-cancelled] Deleted ${cancelled.count} cancelled and ${expired} expired completed appointments`
    );

    return NextResponse.json({
      ok: true,
      deleted: cancelled.count,
      expiredCompleted: expired,
    });
  } catch (error) {
    console.error("Cron cleanup-cancelled error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
