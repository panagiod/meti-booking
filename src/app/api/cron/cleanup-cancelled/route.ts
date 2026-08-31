import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cron: Nightly cleanup of CANCELLED appointments
// Runs once daily (Hobby plan). Removes cancelled appointments to keep the DB clean.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
