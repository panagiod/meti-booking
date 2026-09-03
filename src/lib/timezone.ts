/**
 * Studio timezone — all schedules and slots use this zone regardless of server TZ.
 * Override with STUDIO_TIMEZONE env (IANA name, e.g. Asia/Nicosia).
 */
export const STUDIO_TIMEZONE = process.env.STUDIO_TIMEZONE || "Asia/Nicosia";

/** @deprecated Use STUDIO_TIMEZONE-aware helpers instead */
export const APP_TIMEZONE_OFFSET_HOURS = getFixedOffsetHours(
  new Date("2026-06-15T12:00:00Z"),
  STUDIO_TIMEZONE
);

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    dtf
      .formatToParts(date)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value])
  ) as Record<string, string>;

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return asUtc - date.getTime();
}

function getFixedOffsetHours(date: Date, timeZone: string): number {
  return getTimeZoneOffsetMs(date, timeZone) / (60 * 60 * 1000);
}

export interface StudioLocalDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number;
}

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function utcToStudioLocal(utc: Date): StudioLocalDateTime {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: STUDIO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hour12: false,
  });

  const parts = Object.fromEntries(
    dtf
      .formatToParts(utc)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value])
  ) as Record<string, string>;

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    dayOfWeek: WEEKDAY_MAP[parts.weekday] ?? 0,
  };
}

/** Converts studio-local wall time to a UTC instant. */
export function localToUTCDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string = STUDIO_TIMEZONE
): Date {
  let utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  for (let i = 0; i < 2; i++) {
    const offset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
    utcGuess = Date.UTC(year, month - 1, day, hour, minute) - offset;
  }
  return new Date(utcGuess);
}

export function parseStudioDateOnly(dateStr: string): { year: number; month: number; day: number } | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** Start/end of a calendar day in studio timezone, as UTC instants. */
export function studioDayBoundsUTC(dateStr: string): { start: Date; end: Date } {
  const parts = parseStudioDateOnly(dateStr);
  if (!parts) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  const { year, month, day } = parts;
  const start = localToUTCDate(year, month, day, 0, 0);
  const end = new Date(localToUTCDate(year, month, day, 23, 59).getTime() + 59_999);
  return { start, end };
}

export function getDayOfWeekForStudioDate(dateStr: string): number {
  const parts = parseStudioDateOnly(dateStr);
  if (!parts) return new Date(dateStr).getDay();
  return utcToStudioLocal(localToUTCDate(parts.year, parts.month, parts.day, 12, 0)).dayOfWeek;
}

/** Converts UTC minutes-since-midnight to studio-local minutes-since-midnight. */
export function utcMinutesToLocal(utcMinutes: number, referenceUtc = new Date()): number {
  const utc = new Date(
    Date.UTC(
      referenceUtc.getUTCFullYear(),
      referenceUtc.getUTCMonth(),
      referenceUtc.getUTCDate(),
      Math.floor(utcMinutes / 60),
      utcMinutes % 60
    )
  );
  const local = utcToStudioLocal(utc);
  return local.hour * 60 + local.minute;
}

export function studioLocalMinutesFromUtc(utc: Date): number {
  const local = utcToStudioLocal(utc);
  return local.hour * 60 + local.minute;
}

export function formatStudioDate(utc: Date, options?: Intl.DateTimeFormatOptions): string {
  return utc.toLocaleDateString("en-GB", {
    timeZone: STUDIO_TIMEZONE,
    ...options,
  });
}

export function formatStudioTime(utc: Date): string {
  return utc.toLocaleTimeString("en-GB", {
    timeZone: STUDIO_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function studioDateStrFromUtc(utc: Date): string {
  const local = utcToStudioLocal(utc);
  return `${String(local.year).padStart(4, "0")}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;
}

/** Shift a YYYY-MM-DD studio calendar date by whole days. */
export function addStudioDays(dateStr: string, days: number): string {
  const parts = parseStudioDateOnly(dateStr);
  if (!parts) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  const noon = localToUTCDate(parts.year, parts.month, parts.day, 12, 0);
  return studioDateStrFromUtc(new Date(noon.getTime() + days * 86_400_000));
}

/** Monday (YYYY-MM-DD) of the studio week that contains `reference`. */
export function studioWeekStartDateStr(reference = new Date()): string {
  const today = studioDateStrFromUtc(reference);
  const dow = getDayOfWeekForStudioDate(today);
  const daysFromMonday = dow === 0 ? 6 : dow - 1;
  return addStudioDays(today, -daysFromMonday);
}

/** Inclusive UTC bounds for a Mon–Sun studio week starting on `weekStartDateStr`. */
export function weekBoundsIso(weekStartDateStr = studioWeekStartDateStr()) {
  const start = studioDayBoundsUTC(weekStartDateStr).start;
  const end = studioDayBoundsUTC(addStudioDays(weekStartDateStr, 6)).end;
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Parse YYYY-MM-DDTHH:mm (optional seconds) as studio-local wall time. */
export function parseLocalISO(iso: string): Date | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return null;
  return localToUTCDate(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
    Number(match[5])
  );
}

/** Parse YYYY-MM-DD date input as studio-local start or end of day. */
export function parseStudioDateInput(dateStr: string, endOfDay = false): Date | null {
  const parts = parseStudioDateOnly(dateStr);
  if (!parts) return null;
  if (endOfDay) {
    return new Date(localToUTCDate(parts.year, parts.month, parts.day, 23, 59).getTime() + 59_999);
  }
  return localToUTCDate(parts.year, parts.month, parts.day, 0, 0);
}
