import { addDays, format, startOfDay, isSameDay, getDay, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { utcMinutesToLocal } from "@/lib/timezone";

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

// Timezone offset de la app (Colombia, UTC-5 = -5 horas desde UTC)
// Usado para convertir appointment times (UTC) a hora local para comparar con slots
const APP_TIMEZONE_OFFSET_HOURS = -5;

export function generateAvailableSlots(
  schedule: Schedule,
  serviceDuration: number,
  existingAppointments: Array<{ start: Date; end: Date }> = [],
  blockedTimes: BlockedTime[] = [],
  slotDate?: Date,
  minStartTime?: Date
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

    // Check if slot conflicts with existing appointments
    // Los appointments se guardan en UTC; convertimos a hora local (Colombia)
    // para comparar con los slots (que se generan en hora local).
    const hasAppointmentConflict = existingAppointments.some((apt) => {
      const aptStartLocal = utcMinutesToLocal(apt.start.getUTCHours() * 60 + apt.start.getUTCMinutes());
      const aptEndLocal = utcMinutesToLocal(apt.end.getUTCHours() * 60 + apt.end.getUTCMinutes());
      return current < aptEndLocal && current + serviceDuration > aptStartLocal;
    });

    // Check if slot conflicts with blocked times
    const hasBlockedConflict = slotDate
      ? isSlotBlocked(slotDate, current, current + serviceDuration, blockedTimes)
      : false;

    // Anticipación mínima: ocultar slots que empiezan antes de minStartTime
    const isTooSoon = (() => {
      if (!slotDate || !minStartTime) return false;
      const slotStart = new Date(slotDate);
      slotStart.setHours(Math.floor(current / 60), current % 60, 0, 0);
      return slotStart.getTime() < minStartTime.getTime();
    })();

    slots.push({
      time: slotTime,
      available: !hasAppointmentConflict && !hasBlockedConflict && !isTooSoon,
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
        minStartTime
      );
      const hasAvailability = slots.some((s) => s.available);

      dates.push({
        date,
        dateStr: format(date, "yyyy-MM-dd"),
        dayName: format(date, "EEE", { locale: es }),
        slots,
        hasAvailability,
      });
    } else {
      dates.push({
        date,
        dateStr: format(date, "yyyy-MM-dd"),
        dayName: format(date, "EEE", { locale: es }),
        slots: [],
        hasAvailability: false,
      });
    }
  }

  return dates;
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("es-CO", {
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
