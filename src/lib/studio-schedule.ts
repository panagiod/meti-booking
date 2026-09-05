import { generateAvailableSlots } from "@/lib/slots";
import { siteConfig } from "@/lib/site-config";

/** Reformer class length — matches bookable slot spacing */
export const STUDIO_SESSION_DURATION_MIN = 45;

/** Default afternoon window for new / inactive schedule rows in admin UI */
export const STUDIO_AFTERNOON_START = "15:45";
export const STUDIO_AFTERNOON_END = "18:45";
export const STUDIO_DEFAULT_GAP_MINUTES = 0;

/** Demo seed — Tue, Thu, Sat (admin can change via /admin/schedule) */
export const STUDIO_DEMO_ACTIVE_DAYS = [2, 4, 6] as const;

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
  serviceDurationMin = STUDIO_SESSION_DURATION_MIN
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

const DAY_ABBREV_EN: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

const DAY_ABBREV_EL: Record<number, string> = {
  0: "Κυρ",
  1: "Δευ",
  2: "Τρί",
  3: "Τετ",
  4: "Πέμ",
  5: "Παρ",
  6: "Σάβ",
};

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Hours line for homepage/footer — kept in sync when admin saves calendar */
export function formatScheduleHoursForLocale(
  schedules: StudioDaySchedule[],
  locale: "en" | "el"
): string {
  const active = schedules
    .filter((s) => s.isActive)
    .sort((a, b) => WEEK_ORDER.indexOf(a.dayOfWeek) - WEEK_ORDER.indexOf(b.dayOfWeek));

  if (active.length === 0) {
    return locale === "el" ? "Κλειστά" : "Closed";
  }

  const dayAbbrev = locale === "el" ? DAY_ABBREV_EL : DAY_ABBREV_EN;
  const groups: Array<{ startTime: string; endTime: string; days: number[] }> = [];

  for (const day of active) {
    const existing = groups.find(
      (group) => group.startTime === day.startTime && group.endTime === day.endTime
    );
    if (existing) {
      existing.days.push(day.dayOfWeek);
    } else {
      groups.push({
        startTime: day.startTime,
        endTime: day.endTime,
        days: [day.dayOfWeek],
      });
    }
  }

  return groups
    .map((group) => {
      const days = group.days.map((dow) => dayAbbrev[dow]).join(", ");
      const timeRange =
        locale === "el"
          ? `${group.startTime}–${group.endTime}`
          : `${formatTime12(group.startTime)}–${formatTime12(group.endTime)}`;
      return `${days} ${timeRange}`;
    })
    .join(" · ");
}

/** Demo seed rows: Tue/Thu 15:45–18:00 slots, Sat morning with 10:15–10:30 break */
export function studioScheduleSeedRows() {
  return [
    {
      dayOfWeek: 2,
      startTime: "15:45",
      endTime: "18:45",
      lunchStart: null,
      lunchEnd: null,
      gapMinutes: 0,
    },
    {
      dayOfWeek: 4,
      startTime: "15:45",
      endTime: "18:45",
      lunchStart: null,
      lunchEnd: null,
      gapMinutes: 0,
    },
    {
      dayOfWeek: 6,
      startTime: "08:00",
      endTime: "13:30",
      lunchStart: "10:15",
      lunchEnd: "10:30",
      gapMinutes: 0,
    },
  ] as const;
}

/** Fallback hours string from demo seed (EN) */
export function demoScheduleHoursEn(): string {
  const template = weeklyScheduleTemplate().map((d) => ({
    ...d,
    isActive: (STUDIO_DEMO_ACTIVE_DAYS as readonly number[]).includes(d.dayOfWeek),
    ...(d.dayOfWeek === 2 || d.dayOfWeek === 4
      ? { startTime: "15:45", endTime: "18:45" }
      : d.dayOfWeek === 6
        ? { startTime: "08:00", endTime: "13:30" }
        : {}),
  }));
  return formatScheduleHoursForLocale(template, "en");
}

/** Fallback hours string from demo seed (EL) */
export function demoScheduleHoursEl(): string {
  const template = weeklyScheduleTemplate().map((d) => ({
    ...d,
    isActive: (STUDIO_DEMO_ACTIVE_DAYS as readonly number[]).includes(d.dayOfWeek),
    ...(d.dayOfWeek === 2 || d.dayOfWeek === 4
      ? { startTime: "15:45", endTime: "18:45" }
      : d.dayOfWeek === 6
        ? { startTime: "08:00", endTime: "13:30" }
        : {}),
  }));
  return formatScheduleHoursForLocale(template, "el");
}
