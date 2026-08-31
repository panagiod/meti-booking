import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/slots";
import { resolveBookingLeadHours } from "@/lib/booking-config";
import { siteConfig } from "@/lib/site-config";
import {
  getDayOfWeekForStudioDate,
  studioDayBoundsUTC,
  studioLocalMinutesFromUtc,
  utcToStudioLocal,
} from "@/lib/timezone";

export class SlotBookingError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_TIME"
      | "INACTIVE_DAY"
      | "SLOT_UNAVAILABLE"
      | "ADVISOR_INACTIVE"
      | "SERVICE_MISMATCH"
  ) {
    super(message);
    this.name = "SlotBookingError";
  }
}

function dateStrFromUtc(utc: Date): string {
  const local = utcToStudioLocal(utc);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${local.year}-${pad(local.month)}-${pad(local.day)}`;
}

export async function validateBookableSlot(params: {
  advisorId: string;
  serviceId: string;
  scheduledAt: Date;
}): Promise<void> {
  const { advisorId, serviceId, scheduledAt } = params;

  const advisorProfile = await prisma.advisorProfile.findUnique({
    where: { id: advisorId },
    select: { id: true, isActive: true, bookingLeadHours: true },
  });

  if (!advisorProfile?.isActive) {
    throw new SlotBookingError("Instructor is not available for booking", "ADVISOR_INACTIVE");
  }

  const service = await prisma.advisorService.findUnique({
    where: { id: serviceId },
    select: { id: true, advisorId: true, durationMin: true, isActive: true },
  });

  if (!service?.isActive) {
    throw new SlotBookingError("Service not found", "SERVICE_MISMATCH");
  }

  if (service.advisorId !== advisorId) {
    throw new SlotBookingError("Service does not belong to this instructor", "SERVICE_MISMATCH");
  }

  const dateStr = dateStrFromUtc(scheduledAt);
  const dayOfWeek = getDayOfWeekForStudioDate(dateStr);

  const daySchedule = await prisma.advisorSchedule.findUnique({
    where: { advisorId_dayOfWeek: { advisorId, dayOfWeek } },
  });

  if (!daySchedule?.isActive) {
    throw new SlotBookingError("This day is not available for booking", "INACTIVE_DAY");
  }

  const { start: startOfDay, end: endOfDay } = studioDayBoundsUTC(dateStr);

  const [existingAppointments, blockedTimesRaw] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        advisorId,
        scheduledAt: { gte: startOfDay, lte: endOfDay },
        status: { in: ["CONFIRMED", "IN_PROGRESS", "PENDING"] },
      },
      select: { scheduledAt: true, durationMin: true },
    }),
    prisma.blockedTime.findMany({
      where: {
        advisorId,
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
    }),
  ]);

  const appointments = existingAppointments.map(
    (apt: { scheduledAt: Date; durationMin: number }) => ({
      start: apt.scheduledAt,
      end: new Date(apt.scheduledAt.getTime() + apt.durationMin * 60 * 1000),
    })
  );

  const blockedTimes = blockedTimesRaw.map(
    (bt: { startDate: Date; endDate: Date; isAllDay: boolean }) => ({
      startDate: bt.startDate,
      endDate: bt.endDate,
      isAllDay: bt.isAllDay,
    })
  );

  const leadHours = resolveBookingLeadHours(advisorProfile.bookingLeadHours);
  const minStartTime =
    leadHours > 0
      ? new Date(Date.now() + leadHours * 60 * 60 * 1000)
      : undefined;

  const slots = generateAvailableSlots(
    {
      dayOfWeek: daySchedule.dayOfWeek,
      startTime: daySchedule.startTime,
      endTime: daySchedule.endTime,
      lunchStart: daySchedule.lunchStart,
      lunchEnd: daySchedule.lunchEnd,
      gapMinutes: daySchedule.gapMinutes,
    },
    service.durationMin,
    appointments,
    blockedTimes,
    new Date(`${dateStr}T12:00:00`),
    minStartTime,
    siteConfig.slotCapacity
  );

  const requestedMinutes = studioLocalMinutesFromUtc(scheduledAt);
  const matchingSlot = slots.find((s) => {
    const [h, m] = s.time.split(":").map(Number);
    return h * 60 + m === requestedMinutes;
  });

  if (!matchingSlot?.available) {
    throw new SlotBookingError("This time slot is not available", "SLOT_UNAVAILABLE");
  }
}
