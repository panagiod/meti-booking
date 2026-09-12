import { chunkDates, MAX_SLOT_BATCH_DATES } from "@/lib/slot-dates";
import type { TimeSlot } from "@/lib/slots";

export type SlotsByDate = Record<string, { slots: TimeSlot[]; hasAvailability: boolean }>;

function mapSlotsByDate(slotsByDate: unknown): SlotsByDate {
  const mapped: SlotsByDate = {};
  for (const [dateStr, slots] of Object.entries(
    (slotsByDate ?? {}) as Record<string, TimeSlot[]>
  )) {
    const typedSlots = slots ?? [];
    mapped[dateStr] = {
      slots: typedSlots,
      hasAvailability: typedSlots.some((slot) => slot.available),
    };
  }
  return mapped;
}

async function fetchSlotChunk(
  instructorId: string,
  serviceId: string,
  dateStrs: string[]
): Promise<SlotsByDate> {
  const params = new URLSearchParams({
    instructorId,
    serviceId,
    dates: dateStrs.join(","),
  });

  const res = await fetch(`/api/slots/batch?${params.toString()}`);
  if (!res.ok) return {};

  const data = await res.json();
  return mapSlotsByDate(data.slotsByDate);
}

export async function fetchBatchSlots(
  instructorId: string,
  serviceId: string,
  dateStrs: string[]
): Promise<SlotsByDate> {
  if (dateStrs.length === 0) return {};

  const merged: SlotsByDate = {};
  for (const chunk of chunkDates(dateStrs, MAX_SLOT_BATCH_DATES)) {
    Object.assign(merged, await fetchSlotChunk(instructorId, serviceId, chunk));
  }
  return merged;
}
