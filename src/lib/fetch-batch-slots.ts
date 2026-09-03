import type { TimeSlot } from "@/lib/slots";

export type SlotsByDate = Record<string, { slots: TimeSlot[]; hasAvailability: boolean }>;

export async function fetchBatchSlots(
  instructorId: string,
  serviceId: string,
  dateStrs: string[]
): Promise<SlotsByDate> {
  if (dateStrs.length === 0) return {};

  const params = new URLSearchParams({
    instructorId,
    serviceId,
    dates: dateStrs.join(","),
  });

  const res = await fetch(`/api/slots/batch?${params.toString()}`);
  if (!res.ok) return {};

  const data = await res.json();
  const slotsByDate: SlotsByDate = {};

  for (const [dateStr, slots] of Object.entries(data.slotsByDate ?? {})) {
    const typedSlots = (slots as TimeSlot[]) ?? [];
    slotsByDate[dateStr] = {
      slots: typedSlots,
      hasAvailability: typedSlots.some((s) => s.available),
    };
  }

  return slotsByDate;
}
