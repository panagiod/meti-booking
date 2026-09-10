import { studioDateStrFromUtc } from "@/lib/timezone";

export function groupBookingsByStudioDate<T extends { scheduledAt: string }>(
  bookings: T[]
): Array<{ date: string; items: T[] }> {
  const groups = new Map<string, T[]>();
  for (const booking of bookings) {
    const date = studioDateStrFromUtc(new Date(booking.scheduledAt));
    const items = groups.get(date);
    if (items) items.push(booking);
    else groups.set(date, [booking]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({
      date,
      items: [...items].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    }));
}

export function firstOpenBookingDate(
  dates: string[],
  today = studioDateStrFromUtc(new Date())
): string | undefined {
  return dates.find((date) => date >= today) ?? dates[0];
}
