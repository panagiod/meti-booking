import { describe, expect, it } from "vitest";
import {
  cyprusPublicHolidays,
  isCyprusPublicHoliday,
  orthodoxEasterDate,
  upcomingCyprusHolidays,
} from "@/lib/cyprus-holidays";
import { generateAvailableSlots, isStudioDateBlocked } from "@/lib/slots";

describe("cyprus public holidays", () => {
  it("computes Orthodox Easter for 2026 and 2027", () => {
    expect(orthodoxEasterDate(2026)).toBe("2026-04-12");
    expect(orthodoxEasterDate(2027)).toBe("2027-05-02");
  });

  it("matches the official 2026 Cyprus public-service holidays", () => {
    expect(cyprusPublicHolidays(2026).map((holiday) => holiday.date)).toEqual([
      "2026-01-01",
      "2026-01-06",
      "2026-02-23",
      "2026-03-25",
      "2026-04-01",
      "2026-04-10",
      "2026-04-13",
      "2026-05-01",
      "2026-06-01",
      "2026-08-15",
      "2026-10-01",
      "2026-10-28",
      "2026-12-24",
      "2026-12-25",
      "2026-12-26",
    ]);
  });

  it("matches the official 2027 Cyprus public-service holidays", () => {
    expect(cyprusPublicHolidays(2027).map((holiday) => holiday.date)).toEqual([
      "2027-01-01",
      "2027-01-06",
      "2027-03-15",
      "2027-03-25",
      "2027-04-01",
      "2027-04-30",
      "2027-05-01",
      "2027-05-03",
      "2027-06-21",
      "2027-08-15",
      "2027-10-01",
      "2027-10-28",
      "2027-12-24",
      "2027-12-25",
      "2027-12-26",
    ]);
  });

  it("treats remaining 2026 studio holidays as blocked without an admin block", () => {
    expect(isCyprusPublicHoliday("2026-10-01")).toBe(true);
    expect(isCyprusPublicHoliday("2026-12-24")).toBe(true);
    expect(isCyprusPublicHoliday("2026-12-26")).toBe(true);
    expect(isCyprusPublicHoliday("2026-09-12")).toBe(false);
    expect(isStudioDateBlocked("2026-10-01", [])).toBe(true);
    expect(isStudioDateBlocked("2026-09-12", [])).toBe(false);
  });

  it("leaves no open slots on Cyprus Independence Day 2026", () => {
    const slots = generateAvailableSlots(
      {
        dayOfWeek: 4,
        startTime: "15:45",
        endTime: "18:45",
        lunchStart: null,
        lunchEnd: null,
        gapMinutes: 0,
      },
      45,
      [],
      [],
      new Date("2026-10-01T12:00:00Z")
    );
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every((slot) => !slot.available && slot.remaining === 0)).toBe(true);
  });

  it("lists upcoming holidays from a Cyprus studio date", () => {
    const upcoming = upcomingCyprusHolidays(new Date("2026-09-05T12:00:00Z"), 2026);
    expect(upcoming.map((holiday) => holiday.date)).toEqual([
      "2026-10-01",
      "2026-10-28",
      "2026-12-24",
      "2026-12-25",
      "2026-12-26",
    ]);
  });
});
