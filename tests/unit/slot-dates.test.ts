import { describe, it, expect } from "vitest";
import { chunkDates, MAX_SLOT_BATCH_DATES, parseSlotDates } from "@/lib/slot-dates";
import { MAX_BOOKING_WEEKS_AHEAD } from "@/lib/booking-config";

describe("parseSlotDates", () => {
  it("parses comma-separated valid dates", () => {
    expect(parseSlotDates("2026-09-01, 2026-09-03,2026-09-05")).toEqual([
      "2026-09-01",
      "2026-09-03",
      "2026-09-05",
    ]);
  });

  it("deduplicates dates", () => {
    expect(parseSlotDates("2026-09-01,2026-09-01")).toEqual(["2026-09-01"]);
  });

  it("filters invalid date strings", () => {
    expect(parseSlotDates("2026-9-1,not-a-date,2026-09-02")).toEqual(["2026-09-02"]);
  });

  it("returns empty array for null or empty input", () => {
    expect(parseSlotDates(null)).toEqual([]);
    expect(parseSlotDates("")).toEqual([]);
  });
});

describe("slot batch window", () => {
  it("covers the longest admin booking window, including 10 weeks", () => {
    expect(MAX_SLOT_BATCH_DATES).toBe(MAX_BOOKING_WEEKS_AHEAD * 7);
    expect(MAX_SLOT_BATCH_DATES).toBeGreaterThanOrEqual(10 * 7);
  });

  it("splits a 10-week calendar so the first request never exceeds the batch cap", () => {
    const dates = Array.from({ length: 70 }, (_, index) => `2026-09-${String((index % 28) + 1).padStart(2, "0")}`);
    const chunks = chunkDates(dates, 60);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toHaveLength(60);
    expect(chunks[1]).toHaveLength(10);
  });
});
