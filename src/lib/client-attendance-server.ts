import { prisma } from "@/lib/prisma";
import { attendanceCutoffDateStr } from "@/lib/client-attendance";
import { studioDateStrFromUtc } from "@/lib/timezone";

export async function syncClientAttendance(now = new Date()): Promise<{ recorded: number; pruned: number }> {
  const completed = await prisma.appointment.findMany({
    where: {
      status: { in: ["COMPLETED", "NO_SHOW"] },
      isTest: false,
    },
    select: { id: true, clientId: true, scheduledAt: true },
  });

  let recorded = 0;
  if (completed.length > 0) {
    const result = await prisma.clientAttendance.createMany({
      data: completed.map((row: (typeof completed)[number]) => ({
        clientId: row.clientId,
        appointmentId: row.id,
        studioDate: studioDateStrFromUtc(row.scheduledAt),
      })),
      skipDuplicates: true,
    });
    recorded = result.count;
  }

  const pruned = await prisma.clientAttendance.deleteMany({
    where: { studioDate: { lt: attendanceCutoffDateStr(now) } },
  });

  return { recorded, pruned: pruned.count };
}
