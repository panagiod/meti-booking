import { describe, it, expect } from "vitest";
import {
  validateStudioSchedule,
  countSlotsPerDay,
  weeklyScheduleTemplate,
  mergeScheduleFromDb,
  studioScheduleSeedRows,
  formatScheduleHoursForLocale,
  STUDIO_DEMO_ACTIVE_DAYS,
  STUDIO_SESSION_DURATION_MIN,
} from "@/lib/studio-schedule";
import { generateAvailableSlots } from "@/lib/slots";

describe("studio-schedule", () => {
  it("empty template has no active days", () => {
    const schedule = weeklyScheduleTemplate();
    expect(schedule.filter((d) => d.isActive)).toHaveLength(0);
  });

  it("demo seed uses Tue, Thu, Sat", () => {
    expect(STUDIO_DEMO_ACTIVE_DAYS).toEqual([2, 4, 6]);
    expect(studioScheduleSeedRows()).toHaveLength(3);
  });

  it("generates Tue/Thu afternoon slots at 15:45, 16:30, 17:15, 18:00", () => {
    const row = studioScheduleSeedRows().find((r) => r.dayOfWeek === 2)!;
    const slots = generateAvailableSlots(
      { ...row, dayOfWeek: 2 },
      STUDIO_SESSION_DURATION_MIN,
      [],
      [],
      new Date("2026-09-08"),
      undefined,
      3
    );
    expect(slots.map((s) => s.time)).toEqual(["15:45", "16:30", "17:15", "18:00"]);
  });

  it("generates Saturday morning slots with mid-morning break", () => {
    const row = studioScheduleSeedRows().find((r) => r.dayOfWeek === 6)!;
    const slots = generateAvailableSlots(
      { ...row, dayOfWeek: 6 },
      STUDIO_SESSION_DURATION_MIN,
      [],
      [],
      new Date("2026-09-06"),
      undefined,
      3
    );
    expect(slots.map((s) => s.time)).toEqual([
      "08:00",
      "08:45",
      "09:30",
      "10:30",
      "11:15",
      "12:00",
      "12:45",
    ]);
  });

  it("rejects schedule with no active days", () => {
    const schedule = weeklyScheduleTemplate();
    expect(validateStudioSchedule(schedule)).toMatch(/at least one day/);
  });

  it("accepts Tue/Thu/Sat seed days", () => {
    const schedule = weeklyScheduleTemplate().map((d) => ({
      ...d,
      isActive: [2, 4, 6].includes(d.dayOfWeek),
    }));
    expect(validateStudioSchedule(schedule)).toBeNull();
  });

  it("mergeScheduleFromDb reflects all saved active days", () => {
    const merged = mergeScheduleFromDb([
      { dayOfWeek: 2, isActive: true, startTime: "15:45", endTime: "18:45", lunchStart: null, lunchEnd: null, gapMinutes: 0 },
      { dayOfWeek: 4, isActive: true, startTime: "15:45", endTime: "18:45", lunchStart: null, lunchEnd: null, gapMinutes: 0 },
      { dayOfWeek: 6, isActive: true, startTime: "08:00", endTime: "13:30", lunchStart: "10:15", lunchEnd: "10:30", gapMinutes: 0 },
    ]);
    const active = merged.filter((d) => d.isActive);
    expect(active).toHaveLength(3);
    expect(active.map((d) => d.dayOfWeek)).toEqual([2, 4, 6]);
  });

  it("formats hours line for English and Greek", () => {
    const schedule = weeklyScheduleTemplate().map((d) => {
      const row = studioScheduleSeedRows().find((r) => r.dayOfWeek === d.dayOfWeek);
      return {
        ...d,
        isActive: Boolean(row),
        startTime: row?.startTime ?? d.startTime,
        endTime: row?.endTime ?? d.endTime,
        lunchStart: row?.lunchStart ?? "",
        lunchEnd: row?.lunchEnd ?? "",
        gapMinutes: row?.gapMinutes ?? d.gapMinutes,
      };
    });

    expect(formatScheduleHoursForLocale(schedule, "en")).toBe(
      "Tue, Thu 3:45pm–6:45pm · Sat 8am–1:30pm"
    );
    expect(formatScheduleHoursForLocale(schedule, "el")).toBe(
      "Τρί, Πέμ 15:45–18:45 · Σάβ 08:00–13:30"
    );
  });
});
