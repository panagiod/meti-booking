import { prisma } from "@/lib/prisma";
import { resolveStudioInstructor } from "@/lib/studio-instructor";
import {
  DEFAULT_BOOKING_WEEKS_AHEAD,
  DEFAULT_CANCEL_HOURS,
  DEFAULT_DAILY_BOOKING_LIMIT,
  DEFAULT_MAX_UPCOMING_BOOKINGS,
  DEFAULT_SLOT_CAPACITY,
  resolveBookingWeeksAhead,
  resolveCancelHours,
  resolveDailyBookingLimit,
  resolveMaxUpcomingBookings,
  resolveSlotCapacity,
} from "@/lib/booking-config";

export type StudioBookingSettings = {
  cancelHours: number;
  slotCapacity: number;
  bookingWeeksAhead: number;
  maxUpcomingBookings: number;
  dailyBookingLimit: number;
};

const DEFAULT_SETTINGS: StudioBookingSettings = {
  cancelHours: DEFAULT_CANCEL_HOURS,
  slotCapacity: DEFAULT_SLOT_CAPACITY,
  bookingWeeksAhead: DEFAULT_BOOKING_WEEKS_AHEAD,
  maxUpcomingBookings: DEFAULT_MAX_UPCOMING_BOOKINGS,
  dailyBookingLimit: DEFAULT_DAILY_BOOKING_LIMIT,
};

const PROFILE_SETTINGS_SELECT = {
  slotCapacity: true,
  bookingWeeksAhead: true,
  maxUpcomingBookings: true,
  dailyBookingLimit: true,
} as const;

function settingsFromRows(
  service: { rescheduleHoursMin: number } | null | undefined,
  profile: {
    slotCapacity: number;
    bookingWeeksAhead: number;
    maxUpcomingBookings?: number | null;
    dailyBookingLimit?: number | null;
  } | null | undefined
): StudioBookingSettings {
  return {
    cancelHours: resolveCancelHours(service?.rescheduleHoursMin),
    slotCapacity: resolveSlotCapacity(profile?.slotCapacity),
    bookingWeeksAhead: resolveBookingWeeksAhead(profile?.bookingWeeksAhead),
    maxUpcomingBookings: resolveMaxUpcomingBookings(profile?.maxUpcomingBookings),
    dailyBookingLimit: resolveDailyBookingLimit(profile?.dailyBookingLimit),
  };
}

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
      select: PROFILE_SETTINGS_SELECT,
    }),
  ]);

  return settingsFromRows(service, profile);
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
    maxUpcomingBookings?: number;
    dailyBookingLimit?: number;
  }
): Promise<StudioBookingSettings> {
  if (patch.cancelHours != null) {
    await setStudioCancelHours(instructorId, patch.cancelHours);
  }

  const profileData: {
    slotCapacity?: number;
    bookingWeeksAhead?: number;
    maxUpcomingBookings?: number;
    dailyBookingLimit?: number;
  } = {};
  if (patch.slotCapacity != null) {
    profileData.slotCapacity = resolveSlotCapacity(patch.slotCapacity);
  }
  if (patch.bookingWeeksAhead != null) {
    profileData.bookingWeeksAhead = resolveBookingWeeksAhead(patch.bookingWeeksAhead);
  }
  if (patch.maxUpcomingBookings != null) {
    profileData.maxUpcomingBookings = resolveMaxUpcomingBookings(patch.maxUpcomingBookings);
  }
  if (patch.dailyBookingLimit != null) {
    profileData.dailyBookingLimit = resolveDailyBookingLimit(patch.dailyBookingLimit);
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
      select: PROFILE_SETTINGS_SELECT,
    }),
  ]);

  return settingsFromRows(service, profile);
}
