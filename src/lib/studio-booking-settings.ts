import { prisma } from "@/lib/prisma";
import { resolveStudioInstructor } from "@/lib/studio-instructor";
import {
  DEFAULT_BOOKING_WEEKS_AHEAD,
  DEFAULT_CANCEL_HOURS,
  DEFAULT_SLOT_CAPACITY,
  resolveBookingWeeksAhead,
  resolveCancelHours,
  resolveSlotCapacity,
} from "@/lib/booking-config";

export type StudioBookingSettings = {
  cancelHours: number;
  slotCapacity: number;
  bookingWeeksAhead: number;
};

const DEFAULT_SETTINGS: StudioBookingSettings = {
  cancelHours: DEFAULT_CANCEL_HOURS,
  slotCapacity: DEFAULT_SLOT_CAPACITY,
  bookingWeeksAhead: DEFAULT_BOOKING_WEEKS_AHEAD,
};

export async function getStudioBookingSettings(): Promise<StudioBookingSettings> {
  const instructor = await resolveStudioInstructor();
  if (!instructor) return DEFAULT_SETTINGS;

  const [service, profile] = await Promise.all([
    prisma.instructorService.findFirst({
      where: { instructorId: instructor.id, isActive: true },
      orderBy: { createdAt: "asc" },
      select: { rescheduleHoursMin: true },
    }),
    prisma.instructorProfile.findUnique({
      where: { id: instructor.id },
      select: { slotCapacity: true, bookingWeeksAhead: true },
    }),
  ]);

  return {
    cancelHours: resolveCancelHours(service?.rescheduleHoursMin),
    slotCapacity: resolveSlotCapacity(profile?.slotCapacity),
    bookingWeeksAhead: resolveBookingWeeksAhead(profile?.bookingWeeksAhead),
  };
}

export async function getStudioCancelHours(): Promise<number> {
  const settings = await getStudioBookingSettings();
  return settings.cancelHours;
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

export async function setStudioBookingSettings(
  instructorId: string,
  patch: {
    cancelHours?: number;
    slotCapacity?: number;
    bookingWeeksAhead?: number;
  }
): Promise<StudioBookingSettings> {
  if (patch.cancelHours != null) {
    await setStudioCancelHours(instructorId, patch.cancelHours);
  }

  const profileData: { slotCapacity?: number; bookingWeeksAhead?: number } = {};
  if (patch.slotCapacity != null) {
    profileData.slotCapacity = resolveSlotCapacity(patch.slotCapacity);
  }
  if (patch.bookingWeeksAhead != null) {
    profileData.bookingWeeksAhead = resolveBookingWeeksAhead(patch.bookingWeeksAhead);
  }
  if (Object.keys(profileData).length > 0) {
    await prisma.instructorProfile.update({
      where: { id: instructorId },
      data: profileData,
    });
  }

  const [service, profile] = await Promise.all([
    prisma.instructorService.findFirst({
      where: { instructorId, isActive: true },
      orderBy: { createdAt: "asc" },
      select: { rescheduleHoursMin: true },
    }),
    prisma.instructorProfile.findUnique({
      where: { id: instructorId },
      select: { slotCapacity: true, bookingWeeksAhead: true },
    }),
  ]);

  return {
    cancelHours: resolveCancelHours(service?.rescheduleHoursMin),
    slotCapacity: resolveSlotCapacity(profile?.slotCapacity),
    bookingWeeksAhead: resolveBookingWeeksAhead(profile?.bookingWeeksAhead),
  };
}
