import { describe, it, expect } from "vitest";
import {
  validateStudioSchedule,
  countSlotsPerDay,
  weeklyScheduleTemplate,
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

  it("rejects more than 3 active days", () => {
    const schedule = weeklyScheduleTemplate().map((d) => ({ ...d, isActive: true }));
    expect(validateStudioSchedule(schedule)).toMatch(/at most 3 days/);
  });

  it("accepts valid 3-day afternoon schedule", () => {
    const schedule = weeklyScheduleTemplate();
    expect(validateStudioSchedule(schedule)).toBeNull();
  });
});
