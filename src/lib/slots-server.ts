import { prisma } from "@/lib/prisma";
import { generateAvailableSlots, type TimeSlot } from "@/lib/slots";
import { getDayOfWeekForStudioDate, studioDayBoundsUTC } from "@/lib/timezone";
import { siteConfig } from "@/lib/site-config";
import { resolveBookingLeadHours } from "@/lib/booking-config";

import { isValidSlotDate } from "@/lib/slot-dates";

type AppointmentSlot = { scheduledAt: Date; durationMin: number };
type BlockedSlot = { startDate: Date; endDate: Date; isAllDay: boolean };
type ScheduleRow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  lunchStart: string | null;
  lunchEnd: string | null;
  gapMinutes: number;
};

export async function getSlotsForDate(
  instructorId: string,
  serviceId: string,
  date: string
): Promise<TimeSlot[]> {
  const result = await getSlotsForDates(instructorId, serviceId, [date]);
  return result[date] ?? [];
}

export async function getSlotsForDates(
  instructorId: string,
  serviceId: string,
  dates: string[]
): Promise<Record<string, TimeSlot[]>> {
  if (dates.length === 0) return {};

  const validDates = dates.filter((d) => isValidSlotDate(d));
  if (validDates.length === 0) return {};

  const service = await prisma.instructorService.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  const instructorProfile = await prisma.instructorProfile.findUnique({
    where: { id: instructorId },
    select: { bookingLeadHours: true },
  });

  const leadHours = resolveBookingLeadHours(instructorProfile?.bookingLeadHours);
  const minStartTime =
    leadHours > 0 ? new Date(Date.now() + leadHours * 60 * 60 * 1000) : undefined;

  const dayOfWeeks = [...new Set(validDates.map((d) => getDayOfWeekForStudioDate(d)))];
  const schedules = await prisma.instructorSchedule.findMany({
    where: {
      instructorId,
      dayOfWeek: { in: dayOfWeeks },
      isActive: true,
    },
  });

  const scheduleByDay = new Map<number, ScheduleRow>(
    schedules.map((s: ScheduleRow) => [s.dayOfWeek, s])
  );

  const sortedDates = [...validDates].sort();
  const rangeStart = studioDayBoundsUTC(sortedDates[0]).start;
  const rangeEnd = studioDayBoundsUTC(sortedDates[sortedDates.length - 1]).end;

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      instructorId,
      scheduledAt: {
        gte: rangeStart,
        lte: rangeEnd,
      },
      status: {
        in: ["CONFIRMED", "IN_PROGRESS", "PENDING"],
      },
    },
    select: {
      scheduledAt: true,
      durationMin: true,
    },
  });

  const blockedTimesRaw = await prisma.blockedTime.findMany({
    where: {
      instructorId,
      startDate: { lte: rangeEnd },
      endDate: { gte: rangeStart },
    },
  });

  const blockedTimes = blockedTimesRaw.map((bt: BlockedSlot) => ({
    startDate: bt.startDate,
    endDate: bt.endDate,
    isAllDay: bt.isAllDay,
  }));

  const appointments = existingAppointments.map((apt: AppointmentSlot) => ({
    start: apt.scheduledAt,
    end: new Date(apt.scheduledAt.getTime() + apt.durationMin * 60 * 1000),
  }));

  const result: Record<string, TimeSlot[]> = {};

  for (const date of validDates) {
    const dayOfWeek = getDayOfWeekForStudioDate(date);
    const daySchedule = scheduleByDay.get(dayOfWeek);

    if (!daySchedule) {
      result[date] = [];
      continue;
    }

    const { start: startOfDay, end: endOfDay } = studioDayBoundsUTC(date);
    const dayAppointments = appointments.filter(
      (apt: { start: Date; end: Date }) => apt.start >= startOfDay && apt.start <= endOfDay
    );

    const dayBlocked = blockedTimes.filter(
      (bt: BlockedSlot) => bt.startDate <= endOfDay && bt.endDate >= startOfDay
    );

    const scheduleData = {
      dayOfWeek: daySchedule.dayOfWeek,
      startTime: daySchedule.startTime,
      endTime: daySchedule.endTime,
      lunchStart: daySchedule.lunchStart,
      lunchEnd: daySchedule.lunchEnd,
      gapMinutes: daySchedule.gapMinutes,
    };

    result[date] = generateAvailableSlots(
      scheduleData,
      service.durationMin,
      dayAppointments,
      dayBlocked,
      new Date(`${date}T12:00:00`),
      minStartTime,
      siteConfig.slotCapacity
    );
  }

  return result;
}
