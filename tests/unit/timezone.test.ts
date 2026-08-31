import { describe, it, expect } from "vitest";
import {
  localToUTCDate,
  parseLocalISO,
  getDayOfWeekForStudioDate,
  studioDayBoundsUTC,
  STUDIO_TIMEZONE,
} from "@/lib/timezone";

describe("lib/timezone", () => {
  it("uses Europe/Athens by default", () => {
    expect(STUDIO_TIMEZONE).toBe("Europe/Athens");
  });

  it("localToUTCDate converts Athens summer time (EEST, UTC+3) to UTC", () => {
    const d = localToUTCDate(2026, 8, 17, 14, 0);
    expect(d.toISOString()).toBe("2026-08-17T11:00:00.000Z");
  });

  it("localToUTCDate handles early morning hours", () => {
    const d = localToUTCDate(2026, 1, 15, 9, 30);
    // January is EET (UTC+2)
    expect(d.toISOString()).toBe("2026-01-15T07:30:00.000Z");
  });

  it("parseLocalISO assumes studio local wall time", () => {
    const d = parseLocalISO("2026-08-17T14:30");
    expect(d?.toISOString()).toBe("2026-08-17T11:30:00.000Z");
  });

  it("parseLocalISO accepts seconds in the ISO string", () => {
    const d = parseLocalISO("2026-08-17T14:30:00");
    expect(d?.toISOString()).toBe("2026-08-17T11:30:00.000Z");
  });

  it("parseLocalISO returns null for invalid strings", () => {
    expect(parseLocalISO("not-a-date")).toBeNull();
    expect(parseLocalISO("")).toBeNull();
  });

  it("getDayOfWeekForStudioDate uses studio calendar", () => {
    expect(getDayOfWeekForStudioDate("2026-09-02")).toBe(3); // Wednesday
    expect(getDayOfWeekForStudioDate("2026-09-01")).toBe(2); // Tuesday
  });

  it("studioDayBoundsUTC covers full studio calendar day", () => {
    const { start, end } = studioDayBoundsUTC("2026-09-02");
    expect(start.toISOString()).toBe("2026-09-01T21:00:00.000Z");
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });
});
