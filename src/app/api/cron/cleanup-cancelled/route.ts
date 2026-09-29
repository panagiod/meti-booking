import { NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import {
  pruneExcessCancelledAppointments,
  refreshAppointmentHistory,
} from "@/lib/appointment-complete-server";
import { resolveStudioInstructor } from "@/lib/studio-instructor";

export async function GET(request: Request) {
  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const advisor = await resolveStudioInstructor();
    let prunedCancelled = 0;
    if (advisor) {
      prunedCancelled = await pruneExcessCancelledAppointments(advisor.id);
    }
    const { trimmed } = await refreshAppointmentHistory();

    console.log(
      `[cron/cleanup-cancelled] Pruned ${prunedCancelled} old cancelled rows; ${trimmed} extra completed appointments`
    );

    return NextResponse.json({
      ok: true,
      prunedCancelled,
      expiredCompleted: trimmed,
    });
  } catch (error) {
    console.error("Cron cleanup-cancelled error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
