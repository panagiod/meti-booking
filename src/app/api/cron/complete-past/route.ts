import { NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { completePastAppointments, deleteExcessCompletedAppointments } from "@/lib/appointment-complete-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const completed = await completePastAppointments();
    const trimmed = await deleteExcessCompletedAppointments();
    if (completed > 0 || trimmed > 0) {
      console.log(
        `[cron/complete-past] Marked ${completed} sessions complete, removed ${trimmed} extra completed rows`
      );
    }
    return NextResponse.json({ ok: true, completed, trimmed });
  } catch (error) {
    console.error("Cron complete-past error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
