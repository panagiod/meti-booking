import { prisma } from "@/lib/prisma";
import { resolveStudioInstructor } from "@/lib/studio-instructor";
import { DEFAULT_CANCEL_HOURS, resolveCancelHours } from "@/lib/booking-config";

export async function getStudioCancelHours(): Promise<number> {
  const instructor = await resolveStudioInstructor();
  if (!instructor) return DEFAULT_CANCEL_HOURS;
  const service = await prisma.instructorService.findFirst({
    where: { instructorId: instructor.id, isActive: true },
    orderBy: { createdAt: "asc" },
    select: { rescheduleHoursMin: true },
  });
  return resolveCancelHours(service?.rescheduleHoursMin);
}

/** Writes the cancel window onto every service so booking, email, and legal stay in sync. */
export async function setStudioCancelHours(instructorId: string, hours: number): Promise<number> {
  const value = resolveCancelHours(hours);
  await prisma.instructorService.updateMany({
    where: { instructorId },
    data: { rescheduleHoursMin: value },
  });
  return value;
}
