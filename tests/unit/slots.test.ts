import { describe, it, expect } from "vitest";
import { generateAvailableSlots, isStudioDateBlocked } from "@/lib/slots";
import type { Schedule } from "@/lib/slots";
import { localToUTCDate, parseStudioDateInput } from "@/lib/timezone";

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
    expect(slots.every((s) => s.available && s.remaining === 1)).toBe(true);
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

  it("marks slots as unavailable when capacity is reached at the same start time", () => {
    const aptStart = localToUTCDate(2026, 8, 17, 9, 0);
    const aptEnd = new Date(aptStart.getTime() + 60 * 60 * 1000);
    const appointments = [
      { start: aptStart, end: aptEnd },
      { start: aptStart, end: aptEnd },
      { start: aptStart, end: aptEnd },
    ];
    const slots = generateAvailableSlots(baseSchedule, 60, appointments, [], undefined, undefined, 3);
    const nine = slots.find((s) => s.time === "09:00");
    expect(nine?.available).toBe(false);
    expect(nine?.booked).toBe(3);
    expect(nine?.remaining).toBe(0);
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(true);
  });

  it("allows booking when under capacity at the same start time", () => {
    const aptStart = localToUTCDate(2026, 8, 17, 9, 0);
    const aptEnd = new Date(aptStart.getTime() + 60 * 60 * 1000);
    const slots = generateAvailableSlots(
      baseSchedule,
      60,
      [{ start: aptStart, end: aptEnd }],
      [],
      undefined,
      undefined,
      3
    );
    const nine = slots.find((s) => s.time === "09:00");
    expect(nine?.available).toBe(true);
    expect(nine?.booked).toBe(1);
    expect(nine?.remaining).toBe(2);
  });

  it("marks slots unavailable when capacity is 1 and slot is taken", () => {
    const aptStart = localToUTCDate(2026, 8, 17, 9, 0);
    const aptEnd = new Date(aptStart.getTime() + 60 * 60 * 1000);
    const slots = generateAvailableSlots(baseSchedule, 60, [{ start: aptStart, end: aptEnd }], [], undefined, undefined, 1);
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
    const day = new Date(2026, 7, 17, 12, 0, 0);
    const minStart = localToUTCDate(2026, 8, 17, 9, 45);
    const slots = generateAvailableSlots(baseSchedule, 60, [], [], day, minStart);
    expect(slots.find((s) => s.time === "09:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(true);
    expect(slots.find((s) => s.time === "11:00")?.available).toBe(true);
  });

  it("blocks a Cyprus all-day admin closure so no slot stays open", () => {
    const start = parseStudioDateInput("2026-09-12", false);
    const end = parseStudioDateInput("2026-09-12", true);
    expect(start && end).toBeTruthy();
    expect(isStudioDateBlocked("2026-09-12", [{ startDate: start!, endDate: end!, isAllDay: true }])).toBe(
      true
    );
    expect(isStudioDateBlocked("2026-09-10", [{ startDate: start!, endDate: end!, isAllDay: true }])).toBe(
      false
    );

    const slots = generateAvailableSlots(
      {
        dayOfWeek: 6,
        startTime: "08:00",
        endTime: "13:30",
        lunchStart: "10:15",
        lunchEnd: "10:30",
        gapMinutes: 0,
      },
      45,
      [],
      [{ startDate: start!, endDate: end!, isAllDay: true }],
      new Date("2026-09-12T12:00:00")
    );
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every((slot) => !slot.available && slot.remaining === 0)).toBe(true);
  });

  it("hour-range block marks only overlapping slots as unavailable", () => {
    const day = new Date("2026-08-17T12:00:00Z");
    const slots = generateAvailableSlots(
      baseSchedule,
      60,
      [],
      [
        {
          startDate: localToUTCDate(2026, 8, 17, 9, 30),
          endDate: localToUTCDate(2026, 8, 17, 10, 30),
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
