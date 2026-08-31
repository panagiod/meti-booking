import { describe, it, expect } from "vitest";
import { parseSlotDates } from "@/lib/slot-dates";

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
