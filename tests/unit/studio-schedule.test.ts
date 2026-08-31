import { describe, it, expect } from "vitest";
import {
  validateStudioSchedule,
  countSlotsPerDay,
  weeklyScheduleTemplate,
  capWeeklyScheduleRows,
  STUDIO_MAX_ACTIVE_DAYS,
} from "@/lib/studio-schedule";

describe("studio-schedule", () => {
  it("default template has 3 active days", () => {
    const schedule = weeklyScheduleTemplate();
    const active = schedule.filter((d) => d.isActive);
    expect(active).toHaveLength(STUDIO_MAX_ACTIVE_DAYS);
    expect(active.map((d) => d.dayOfWeek)).toEqual([2, 4, 6]);
  });

  it("produces 3 slots per afternoon window (50 min + 10 min gap)", () => {
    const tuesday = weeklyScheduleTemplate().find((d) => d.dayOfWeek === 2)!;
    expect(countSlotsPerDay(tuesday, 50)).toBe(3);
  });

  it("rejects fewer or more than 3 active days", () => {
    const twoDays = weeklyScheduleTemplate().map((d) => ({
      ...d,
      isActive: d.dayOfWeek === 2 || d.dayOfWeek === 4,
    }));
    expect(validateStudioSchedule(twoDays)).toMatch(/exactly 3 days/);

    const fourDays = weeklyScheduleTemplate().map((d) => ({
      ...d,
      isActive: [1, 2, 4, 6].includes(d.dayOfWeek),
    }));
    expect(validateStudioSchedule(fourDays)).toMatch(/exactly 3 days/);
  });

  it("accepts valid 3-day afternoon schedule", () => {
    const schedule = weeklyScheduleTemplate();
    expect(validateStudioSchedule(schedule)).toBeNull();
  });

  it("caps extra DB schedule rows to 3 days", () => {
    const rows = [1, 2, 3, 4, 5].map((dayOfWeek) => ({ dayOfWeek }));
    const capped = capWeeklyScheduleRows(rows);
    expect(capped).toHaveLength(3);
    expect(capped.map((r) => r.dayOfWeek)).toEqual([1, 2, 3]);
  });
});
