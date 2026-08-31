// App timezone (Colombia, UTC-5)
// All schedules and slots are interpreted in this timezone,
// regardless of the server timezone (Vercel uses UTC).
export const APP_TIMEZONE_OFFSET_HOURS = -5;

// Converts local time (Colombia) to an explicit UTC timestamp.
// Example: 2026-08-17 09:00 local → 2026-08-17T14:00:00.000Z
export function localToUTCDate(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number
): Date {
  return new Date(
    Date.UTC(year, month - 1, day, hour - APP_TIMEZONE_OFFSET_HOURS, minute)
  );
}

// Converts UTC minutes to local minutes (Colombia).
// Example: 14:00 UTC → 09:00 local
export function utcMinutesToLocal(utcMinutes: number): number {
  return (((utcMinutes + APP_TIMEZONE_OFFSET_HOURS * 60) % (24 * 60)) + 24 * 60) % (24 * 60);
}

// Extracts date/time from an ISO string (ignores the string offset,
// assumes components represent Colombia local time).
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
