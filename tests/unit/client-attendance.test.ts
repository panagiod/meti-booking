import { describe, expect, it } from "vitest";
import {
  attendanceCutoffDateStr,
  groupAttendanceDatesByMonth,
  richerYearAttendance,
  summarizeYearAttendance,
  yearAttendanceFromAppointments,
} from "@/lib/client-attendance";

describe("summarizeYearAttendance", () => {
  it("counts every class and lists unique dates newest first", () => {
    const summary = summarizeYearAttendance(
      [
        { studioDate: "2026-09-10" },
        { studioDate: "2026-09-10" },
        { studioDate: "2026-08-01" },
        { studioDate: "2025-01-01" },
      ],
      "2025-09-10"
    );
    expect(summary.count).toBe(3);
    expect(summary.dates).toEqual(["2026-09-10", "2026-08-01"]);
  });
});

describe("groupAttendanceDatesByMonth", () => {
  it("groups newest dates into months", () => {
    expect(
      groupAttendanceDatesByMonth(["2026-09-10", "2026-09-04", "2026-08-12"])
    ).toEqual([
      { month: "2026-09", dates: ["2026-09-10", "2026-09-04"] },
      { month: "2026-08", dates: ["2026-08-12"] },
    ]);
  });
});

describe("attendanceCutoffDateStr", () => {
  it("is about one year before today in the studio calendar", () => {
    const cutoff = attendanceCutoffDateStr(new Date("2026-09-10T12:00:00Z"));
    expect(cutoff.startsWith("2025-09")).toBe(true);
  });
});

describe("yearAttendanceFromAppointments", () => {
  it("counts completed classes in the last year when the date log is empty", () => {
    const summary = yearAttendanceFromAppointments(
      [
        { scheduledAt: "2026-09-10T12:45:00.000Z", status: "COMPLETED" },
        { scheduledAt: "2026-08-01T12:45:00.000Z", status: "CONFIRMED" },
        { scheduledAt: "2025-01-01T12:45:00.000Z", status: "COMPLETED" },
        { scheduledAt: "2026-07-01T12:45:00.000Z", status: "COMPLETED", isTest: true },
      ],
      "2025-09-10"
    );
    expect(summary.count).toBe(1);
    expect(summary.dates).toEqual(["2026-09-10"]);
  });
});

describe("richerYearAttendance", () => {
  it("keeps the larger of the date log and remaining booking rows", () => {
    expect(
      richerYearAttendance(
        { count: 0, dates: [] },
        { count: 2, dates: ["2026-09-10", "2026-08-01"] }
      ).count
    ).toBe(2);
    expect(
      richerYearAttendance(
        { count: 12, dates: ["2026-09-10"] },
        { count: 2, dates: ["2026-09-10", "2026-08-01"] }
      ).count
    ).toBe(12);
  });
});
