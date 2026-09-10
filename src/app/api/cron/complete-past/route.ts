import { NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { completePastAppointments } from "@/lib/appointment-complete-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const completed = await completePastAppointments();
    if (completed > 0) {
      console.log(`[cron/complete-past] Marked ${completed} sessions complete`);
    }
    return NextResponse.json({ ok: true, completed });
  } catch (error) {
    console.error("Cron complete-past error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
