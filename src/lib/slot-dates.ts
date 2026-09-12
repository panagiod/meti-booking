import { MAX_BOOKING_WINDOW_DAYS } from "@/lib/booking-config";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const MAX_SLOT_BATCH_DATES = MAX_BOOKING_WINDOW_DAYS;

export function chunkDates(dates: string[], size = MAX_SLOT_BATCH_DATES): string[][] {
  if (size <= 0) return dates.length ? [dates] : [];
  const chunks: string[][] = [];
  for (let i = 0; i < dates.length; i += size) {
    chunks.push(dates.slice(i, i + size));
  }
  return chunks;
}

export function parseSlotDates(datesParam: string | null): string[] {
  if (!datesParam) return [];
  const unique = [...new Set(datesParam.split(",").map((d) => d.trim()).filter(Boolean))];
  return unique.filter((d) => DATE_RE.test(d));
}

export function isValidSlotDate(date: string): boolean {
  return DATE_RE.test(date);
}
