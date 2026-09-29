import { prisma } from "@/lib/prisma";
import { CANCELLED_HISTORY_LIMIT, idsBeyondCancelledHistoryLimit, idsToComplete } from "@/lib/appointment-complete";
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

/** Drop oldest cancelled rows beyond the admin history cap (slots already freed at cancel time). */
export async function pruneExcessCancelledAppointments(
  instructorId: string,
  limit = CANCELLED_HISTORY_LIMIT
): Promise<number> {
  const cancelled = await prisma.appointment.findMany({
    where: { instructorId, status: "CANCELLED" },
    select: { id: true, cancelledAt: true, updatedAt: true },
  });
  const extraIds = idsBeyondCancelledHistoryLimit(cancelled, limit);
  if (extraIds.length === 0) return 0;
  const result = await prisma.appointment.deleteMany({ where: { id: { in: extraIds } } });
  return result.count;
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
