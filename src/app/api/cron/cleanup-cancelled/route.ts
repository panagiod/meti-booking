import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCronAuth } from "@/lib/cron-auth";

export async function GET(request: Request) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    // Delete all CANCELLED appointments (no dependencies: Review and ChatMessage have onDelete: Cascade)
    const result = await prisma.appointment.deleteMany({
      where: { status: "CANCELLED" },
    });

    console.log(`[cron/cleanup-cancelled] Deleted ${result.count} cancelled appointments`);

    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (error) {
    console.error("Cron cleanup-cancelled error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
