import { prisma } from "@/lib/prisma";
import { idsToComplete } from "@/lib/appointment-complete";

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
