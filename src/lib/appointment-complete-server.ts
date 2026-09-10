import { prisma } from "@/lib/prisma";
import { idsToComplete } from "@/lib/appointment-complete";
import { syncClientAttendance } from "@/lib/client-attendance-server";

/** Mark confirmed sessions as completed once their class time has finished. */
export async function completePastAppointments(now = new Date()): Promise<number> {
  const candidates = await prisma.appointment.findMany({
    where: {
      status: { in: ["CONFIRMED", "IN_PROGRESS"] },
      scheduledAt: { lte: now },
    },
    select: { id: true, scheduledAt: true, durationMin: true },
  });

  const ids = idsToComplete(candidates, now);
  if (ids.length === 0) return 0;

  const result = await prisma.appointment.updateMany({
    where: {
      id: { in: ids },
      status: { in: ["CONFIRMED", "IN_PROGRESS"] },
    },
    data: { status: "COMPLETED" },
  });

  return result.count;
}

/** Do not delete live booking history. The Clients page already shows only the last 8. */
export async function deleteExcessCompletedAppointments(): Promise<number> {
  return 0;
}

/** Complete finished classes and store year dates. Never delete bookings from a page load. */
export async function refreshAppointmentHistory(now = new Date()): Promise<{
  completed: number;
  trimmed: number;
}> {
  const completed = await completePastAppointments(now);
  try {
    await syncClientAttendance(now);
  } catch (error) {
    console.error("Could not sync client attendance", error);
  }
  return { completed, trimmed: 0 };
}
