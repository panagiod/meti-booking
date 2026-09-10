import { prisma } from "@/lib/prisma";
import { idsBeyondCompletedHistoryLimit, idsToComplete } from "@/lib/appointment-complete";

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

/** Keep only the completed classes admin can see (last 8 per client). */
export async function deleteExcessCompletedAppointments(): Promise<number> {
  const rows = await prisma.appointment.findMany({
    where: { status: { in: ["COMPLETED", "NO_SHOW"] } },
    select: { id: true, clientId: true, scheduledAt: true },
  });
  const ids = idsBeyondCompletedHistoryLimit(rows);
  if (ids.length === 0) return 0;
  const result = await prisma.appointment.deleteMany({
    where: { id: { in: ids } },
  });
  return result.count;
}
