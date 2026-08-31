import { describe, it, expect } from "vitest";
import {
  validateStudioSchedule,
  countSlotsPerDay,
  weeklyScheduleTemplate,
  mergeScheduleFromDb,
  studioScheduleSeedRows,
  formatScheduleHoursForLocale,
  STUDIO_DEMO_ACTIVE_DAYS,
} from "@/lib/studio-schedule";

describe("studio-schedule", () => {
  it("empty template has no active days", () => {
    const schedule = weeklyScheduleTemplate();
    expect(schedule.filter((d) => d.isActive)).toHaveLength(0);
  });

  it("demo seed uses Mon, Wed, Sat", () => {
    expect(STUDIO_DEMO_ACTIVE_DAYS).toEqual([1, 3, 6]);
    expect(studioScheduleSeedRows()).toHaveLength(3);
  });

  it("produces 3 slots per 3-hour afternoon window (50 min + 10 min gap)", () => {
    const sample = {
      startTime: "14:00",
      endTime: "17:00",
      lunchStart: "",
      lunchEnd: "",
      gapMinutes: 10,
    };
    expect(countSlotsPerDay(sample, 50)).toBe(3);
  });

  it("rejects schedule with no active days", () => {
    const schedule = weeklyScheduleTemplate();
    expect(validateStudioSchedule(schedule)).toMatch(/at least one day/);
  });

  it("accepts any number of active days (e.g. Mon/Wed/Sat)", () => {
    const schedule = weeklyScheduleTemplate().map((d) => ({
      ...d,
      isActive: [1, 3, 6].includes(d.dayOfWeek),
    }));
    expect(validateStudioSchedule(schedule)).toBeNull();
  });

  it("mergeScheduleFromDb reflects all saved active days", () => {
    const merged = mergeScheduleFromDb([
      { dayOfWeek: 1, isActive: true, startTime: "10:00", endTime: "12:00", lunchStart: null, lunchEnd: null, gapMinutes: 10 },
      { dayOfWeek: 3, isActive: true, startTime: "14:00", endTime: "17:00", lunchStart: null, lunchEnd: null, gapMinutes: 10 },
      { dayOfWeek: 6, isActive: true, startTime: "09:00", endTime: "11:00", lunchStart: null, lunchEnd: null, gapMinutes: 10 },
    ]);
    const active = merged.filter((d) => d.isActive);
    expect(active).toHaveLength(3);
    expect(active.map((d) => d.dayOfWeek)).toEqual([1, 3, 6]);
  });

  it("formats hours line for English and Greek", () => {
    const schedule = weeklyScheduleTemplate().map((d) => ({
      ...d,
      isActive: [1, 3, 6].includes(d.dayOfWeek),
    }));

    expect(formatScheduleHoursForLocale(schedule, "en")).toBe("Mon, Wed, Sat · 2pm–5pm");
    expect(formatScheduleHoursForLocale(schedule, "el")).toBe("Δευ, Τετ, Σάβ · 14:00–17:00");
  });
});
