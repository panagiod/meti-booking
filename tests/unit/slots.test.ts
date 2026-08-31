import { describe, it, expect } from "vitest";
import { generateAvailableSlots } from "@/lib/slots";
import type { Schedule } from "@/lib/slots";

const baseSchedule: Schedule = {
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "12:00",
  lunchStart: null,
  lunchEnd: null,
  gapMinutes: 0,
};

describe("lib/slots — generateAvailableSlots", () => {
  it("generates slots based on duration and schedule range", () => {
    const slots = generateAvailableSlots(baseSchedule, 60);
    expect(slots.map((s) => s.time)).toEqual(["09:00", "10:00", "11:00"]);
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it("does not generate a slot that exceeds the end of the schedule", () => {
    const slots = generateAvailableSlots(baseSchedule, 90);
    // 09:00, 10:30 → 12:00 exactly does not fit (10:30+90=12:00 == end, fits);
    expect(slots.map((s) => s.time)).toEqual(["09:00", "10:30"]);
  });

  it("applies the gap between appointments", () => {
    const slots = generateAvailableSlots({ ...baseSchedule, gapMinutes: 30 }, 60);
    expect(slots.map((s) => s.time)).toEqual(["09:00", "10:30"]);
  });

  it("skips the lunch block and does not generate slots that cross it", () => {
    const slots = generateAvailableSlots(
      { ...baseSchedule, startTime: "09:00", endTime: "15:00", lunchStart: "12:00", lunchEnd: "13:00" },
      60
    );
    expect(slots.map((s) => s.time)).toEqual([
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
    ]);
  });

  it("a 90-min slot that would cross lunch jumps to the end of lunch", () => {
    const slots = generateAvailableSlots(
      { ...baseSchedule, startTime: "09:00", endTime: "15:00", lunchStart: "12:00", lunchEnd: "13:00" },
      90
    );
    expect(slots.map((s) => s.time)).toEqual(["09:00", "10:30", "13:00"]);
  });

  it("marks slots that conflict with existing appointments as unavailable (UTC→local)", () => {
    // Existing appointment at 14:00 UTC = 09:00 Colombia local
    const aptStart = new Date("2026-08-17T14:00:00.000Z");
    const aptEnd = new Date("2026-08-17T15:00:00.000Z");
    const slots = generateAvailableSlots(baseSchedule, 60, [{ start: aptStart, end: aptEnd }]);
    expect(slots.find((s) => s.time === "09:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(true);
  });

  it("marks all slots unavailable on an all-day blocked day", () => {
    const day = new Date("2026-08-17T12:00:00.000Z");
    const slots = generateAvailableSlots(
      baseSchedule,
      60,
      [],
      [{ startDate: new Date("2026-08-17T00:00:00.000Z"), endDate: new Date("2026-08-17T23:59:59.000Z"), isAllDay: true }],
      day
    );
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every((s) => !s.available)).toBe(true);
  });

  it("marks slots before minStartTime as unavailable (advance notice)", () => {
    const day = new Date(2026, 7, 17, 12, 0, 0); // server local noon
    const minStart = new Date(2026, 7, 17, 10, 0, 0);
    const slots = generateAvailableSlots(baseSchedule, 60, [], [], day, minStart);
    expect(slots.find((s) => s.time === "09:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(true);
    expect(slots.find((s) => s.time === "11:00")?.available).toBe(true);
  });

  it("hour-range block marks only overlapping slots as unavailable", () => {
    const day = new Date(2026, 7, 17, 12, 0, 0);
    const slots = generateAvailableSlots(
      baseSchedule,
      60,
      [],
      [
        {
          startDate: new Date(2026, 7, 17, 9, 30, 0),
          endDate: new Date(2026, 7, 17, 10, 30, 0),
          isAllDay: false,
        },
      ],
      day
    );
    expect(slots.find((s) => s.time === "09:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "11:00")?.available).toBe(true);
  });
});
