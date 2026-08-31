import { generateAvailableSlots } from "@/lib/slots";
import { siteConfig } from "@/lib/site-config";

/** Default afternoon window for new / demo schedule rows */
export const STUDIO_AFTERNOON_START = "14:00";
export const STUDIO_AFTERNOON_END = "17:00";
export const STUDIO_DEFAULT_GAP_MINUTES = 10;

/** Demo seed only — Mon, Wed, Sat (admin can change via /admin/schedule) */
export const STUDIO_DEMO_ACTIVE_DAYS = [1, 3, 6] as const;

export interface StudioDaySchedule {
  dayOfWeek: number;
  dayName: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  lunchStart: string;
  lunchEnd: string;
  gapMinutes: number;
}

const DAY_NAMES: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

/** Empty week template — active days come from the database after admin saves. */
export function weeklyScheduleTemplate(): StudioDaySchedule[] {
  return [1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => ({
    dayOfWeek,
    dayName: DAY_NAMES[dayOfWeek],
    isActive: false,
    startTime: STUDIO_AFTERNOON_START,
    endTime: STUDIO_AFTERNOON_END,
    lunchStart: "",
    lunchEnd: "",
    gapMinutes: STUDIO_DEFAULT_GAP_MINUTES,
  }));
}

export function mergeScheduleFromDb(
  dbSchedules: Array<{
    dayOfWeek: number;
    isActive: boolean;
    startTime: string;
    endTime: string;
    lunchStart: string | null;
    lunchEnd: string | null;
    gapMinutes: number;
  }>
): StudioDaySchedule[] {
  return weeklyScheduleTemplate().map((day) => {
    const dbDay = dbSchedules.find((s) => s.dayOfWeek === day.dayOfWeek);
    if (!dbDay) return day;
    return {
      ...day,
      isActive: dbDay.isActive !== false,
      startTime: dbDay.startTime,
      endTime: dbDay.endTime,
      lunchStart: dbDay.lunchStart || "",
      lunchEnd: dbDay.lunchEnd || "",
      gapMinutes: dbDay.gapMinutes,
    };
  });
}

export type ScheduleInput = {
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  lunchStart?: string | null;
  lunchEnd?: string | null;
  gapMinutes: number;
  dayName?: string;
};

export function validateStudioSchedule(schedules: ScheduleInput[]): string | null {
  const active = schedules.filter((s) => s.isActive);

  if (active.length === 0) {
    return "Enable at least one day for bookings.";
  }

  const dayNames: Record<number, string> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

  for (const day of active) {
    const label = day.dayName ?? dayNames[day.dayOfWeek] ?? "Day";
    const start = timeToMinutes(day.startTime);
    const end = timeToMinutes(day.endTime);

    if (end <= start) {
      return `${label}: end time must be after start time.`;
    }
  }

  return null;
}

export function countSlotsPerDay(
  schedule: Pick<StudioDaySchedule, "startTime" | "endTime" | "lunchStart" | "lunchEnd" | "gapMinutes">,
  serviceDurationMin = 50
): number {
  const slots = generateAvailableSlots(
    {
      dayOfWeek: 0,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      lunchStart: schedule.lunchStart || null,
      lunchEnd: schedule.lunchEnd || null,
      gapMinutes: schedule.gapMinutes,
    },
    serviceDurationMin,
    [],
    [],
    undefined,
    undefined,
    siteConfig.slotCapacity
  );
  return slots.length;
}

export function formatActiveDaysSummary(schedules: StudioDaySchedule[]): string {
  const active = schedules
    .filter((s) => s.isActive)
    .sort((a, b) => {
      const order = [1, 2, 3, 4, 5, 6, 0];
      return order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek);
    });

  if (active.length === 0) return "No days open";

  const days = active.map((d) => d.dayName.slice(0, 3)).join(", ");
  const times = active.map(
    (d) => `${d.dayName.slice(0, 3)} ${formatTime12(d.startTime)}–${formatTime12(d.endTime)}`
  );
  if (active.every((d) => d.startTime === active[0].startTime && d.endTime === active[0].endTime)) {
    return `${days} · ${formatTime12(active[0].startTime)}–${formatTime12(active[0].endTime)}`;
  }
  return times.join(" · ");
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12}${suffix}` : `${hour12}:${m.toString().padStart(2, "0")}${suffix}`;
}

/** Seed rows for demo-setup (Mon, Wed, Sat afternoons) */
export function studioScheduleSeedRows() {
  return STUDIO_DEMO_ACTIVE_DAYS.map((dayOfWeek) => ({
    dayOfWeek,
    startTime: STUDIO_AFTERNOON_START,
    endTime: STUDIO_AFTERNOON_END,
    lunchStart: null,
    lunchEnd: null,
    gapMinutes: STUDIO_DEFAULT_GAP_MINUTES,
  }));
}
