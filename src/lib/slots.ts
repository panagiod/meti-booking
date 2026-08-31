import { addDays, format, startOfDay, isSameDay, getDay, isWithinInterval } from "date-fns";
import { enUS } from "date-fns/locale";
import { localToUTCDate, studioLocalMinutesFromUtc } from "@/lib/timezone";
import { siteConfig } from "@/lib/site-config";

export interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  lunchStart: string | null;
  lunchEnd: string | null;
  gapMinutes: number;
}

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
  promotion?: {
    id: string;
    name: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  } | null;
}

export interface BlockedTime {
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  booked: number;
  capacity: number;
  remaining: number;
}

export interface DaySlots {
  date: Date;
  dateStr: string;
  dayName: string;
  slots: TimeSlot[];
  hasAvailability: boolean;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function appointmentStartMinutesLocal(start: Date): number {
  return studioLocalMinutesFromUtc(start);
}

export function countBookingsAtSlotTime(
  slotStartMinutes: number,
  existingAppointments: Array<{ start: Date }>
): number {
  return existingAppointments.filter(
    (apt) => appointmentStartMinutesLocal(apt.start) === slotStartMinutes
  ).length;
}

function isSlotBlocked(
  date: Date,
  slotStartMinutes: number,
  slotEndMinutes: number,
  blockedTimes: BlockedTime[]
): boolean {
  const slotDate = startOfDay(date);
  
  return blockedTimes.some((bt) => {
    const btStart = new Date(bt.startDate);
    const btEnd = new Date(bt.endDate);
    
    if (bt.isAllDay) {
      // All-day block: check if date falls within range
      return isWithinInterval(slotDate, { start: startOfDay(btStart), end: startOfDay(btEnd) });
    } else {
      // Time-specific block: check for overlap
      const btStartMinutes = btStart.getHours() * 60 + btStart.getMinutes();
      const btEndMinutes = btEnd.getHours() * 60 + btEnd.getMinutes();
      
      // Check if same day and overlapping
      if (isSameDay(slotDate, btStart) || isSameDay(slotDate, btEnd)) {
        return slotStartMinutes < btEndMinutes && slotEndMinutes > btStartMinutes;
      }
      
      return false;
    }
  });
}

export function generateAvailableSlots(
  schedule: Schedule,
  serviceDuration: number,
  existingAppointments: Array<{ start: Date; end: Date }> = [],
  blockedTimes: BlockedTime[] = [],
  slotDate?: Date,
  minStartTime?: Date,
  slotCapacity: number = 1
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const start = timeToMinutes(schedule.startTime);
  const end = timeToMinutes(schedule.endTime);
  const lunchS = schedule.lunchStart ? timeToMinutes(schedule.lunchStart) : null;
  const lunchE = schedule.lunchEnd ? timeToMinutes(schedule.lunchEnd) : null;
  const gap = schedule.gapMinutes;

  let current = start;

  while (current + serviceDuration <= end) {
    // Skip lunch break
    if (lunchS !== null && current < lunchE! && current + serviceDuration > lunchS) {
      current = lunchE!;
      continue;
    }

    // Don't cross lunch
    if (lunchS !== null && current + serviceDuration > lunchS && current < lunchS) {
      current = lunchS;
      continue;
    }

    const slotTime = minutesToTime(current);
    const booked = countBookingsAtSlotTime(current, existingAppointments);
    const remaining = Math.max(slotCapacity - booked, 0);

    // Check if slot conflicts with blocked times
    const hasBlockedConflict = slotDate
      ? isSlotBlocked(slotDate, current, current + serviceDuration, blockedTimes)
      : false;

    // Minimum lead time: hide slots that start before minStartTime
    const isTooSoon = (() => {
      if (!slotDate || !minStartTime) return false;
      const y = slotDate.getFullYear();
      const m = slotDate.getMonth() + 1;
      const d = slotDate.getDate();
      const slotStart = localToUTCDate(y, m, d, Math.floor(current / 60), current % 60);
      return slotStart.getTime() < minStartTime.getTime();
    })();

    slots.push({
      time: slotTime,
      available: remaining > 0 && !hasBlockedConflict && !isTooSoon,
      booked,
      capacity: slotCapacity,
      remaining,
    });

    current += serviceDuration + gap;
  }

  return slots;
}

export function getAvailableDates(
  schedules: Schedule[],
  serviceDuration: number,
  weeksToShow: number = 2,
  blockedTimes: BlockedTime[] = [],
  leadHours: number = 0
): DaySlots[] {
  const today = startOfDay(new Date());
  const minStartTime = leadHours > 0 ? new Date(Date.now() + leadHours * 60 * 60 * 1000) : undefined;
  const dates: DaySlots[] = [];

  for (let i = 0; i < weeksToShow * 7; i++) {
    const date = addDays(today, i);
    const dayOfWeek = getDay(date);
    
    // Find schedule for this day (0=Sun, 1=Mon, etc.)
    const daySchedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);

    // Check if entire day is blocked
    const isDayBlocked = blockedTimes.some((bt) => {
      if (!bt.isAllDay) return false;
      const btStart = startOfDay(new Date(bt.startDate));
      const btEnd = startOfDay(new Date(bt.endDate));
      return isWithinInterval(date, { start: btStart, end: btEnd });
    });

    if (daySchedule && !isDayBlocked) {
      const slots = generateAvailableSlots(
        daySchedule,
        serviceDuration,
        [],
        blockedTimes,
        date,
        minStartTime,
        siteConfig.slotCapacity
      );
      const hasAvailability = slots.some((s) => s.available);

      dates.push({
        date,
        dateStr: format(date, "yyyy-MM-dd"),
        dayName: format(date, "EEE", { locale: enUS }),
        slots,
        hasAvailability,
      });
    } else {
      dates.push({
        date,
        dateStr: format(date, "yyyy-MM-dd"),
        dayName: format(date, "EEE", { locale: enUS }),
        slots: [],
        hasAvailability: false,
      });
    }
  }

  return dates;
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}
