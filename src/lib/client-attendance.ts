import { addStudioDays, studioDateStrFromUtc } from "@/lib/timezone";

/** Slim date log for admin year metrics. Full booking rows stay at last 8. */
export const ATTENDANCE_RETENTION_DAYS = 365;

export function attendanceCutoffDateStr(now = new Date()): string {
  return addStudioDays(studioDateStrFromUtc(now), -ATTENDANCE_RETENTION_DAYS);
}

export function summarizeYearAttendance(
  rows: Array<{ studioDate: string }>,
  cutoffDateStr: string
): { count: number; dates: string[] } {
  const dates = [
    ...new Set(
      rows
        .map((row) => row.studioDate)
        .filter((date) => date >= cutoffDateStr)
    ),
  ].sort((a, b) => b.localeCompare(a));
  return { count: rows.filter((row) => row.studioDate >= cutoffDateStr).length, dates };
}

export function groupAttendanceDatesByMonth(
  dates: string[]
): Array<{ month: string; dates: string[] }> {
  const groups: Array<{ month: string; dates: string[] }> = [];
  for (const date of dates) {
    const month = date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.dates.push(date);
    else groups.push({ month, dates: [date] });
  }
  return groups;
}
