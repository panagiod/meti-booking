import { describe, it, expect } from "vitest";
import {
  localToUTCDate,
  utcMinutesToLocal,
  parseLocalISO,
} from "@/lib/timezone";

describe("lib/timezone", () => {
  it("localToUTCDate converts Colombia time (UTC-5) to explicit UTC", () => {
    const d = localToUTCDate(2026, 8, 17, 9, 0);
    expect(d.toISOString()).toBe("2026-08-17T14:00:00.000Z");
  });

  it("localToUTCDate handles midnight and morning hours", () => {
    const d = localToUTCDate(2026, 1, 1, 0, 30);
    expect(d.toISOString()).toBe("2026-01-01T05:30:00.000Z");
  });

  it("utcMinutesToLocal converts 14:00 UTC to 09:00 local", () => {
    expect(utcMinutesToLocal(14 * 60)).toBe(9 * 60);
  });

  it("utcMinutesToLocal wraps correctly past midnight", () => {
    // 03:00 UTC → 22:00 local on the previous day (wrapped)
    expect(utcMinutesToLocal(3 * 60)).toBe(22 * 60);
    // 00:00 UTC → 19:00 local
    expect(utcMinutesToLocal(0)).toBe(19 * 60);
  });

  it("parseLocalISO ignores the string offset and assumes Colombia local time", () => {
    const d = parseLocalISO("2026-08-17T09:30");
    expect(d?.toISOString()).toBe("2026-08-17T14:30:00.000Z");
  });

  it("parseLocalISO accepts seconds in the ISO string", () => {
    const d = parseLocalISO("2026-08-17T09:30:00");
    expect(d?.toISOString()).toBe("2026-08-17T14:30:00.000Z");
  });

  it("parseLocalISO returns null for invalid strings", () => {
    expect(parseLocalISO("not-a-date")).toBeNull();
    expect(parseLocalISO("")).toBeNull();
  });
});
