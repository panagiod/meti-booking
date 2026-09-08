import { describe, expect, it } from "vitest";
import {
  evaluateMonitor,
  shouldSendAlert,
  upcomingPlacesCapacity,
  type MonitorSample,
} from "@/lib/studio-monitor";
import { siteConfig } from "@/lib/site-config";
import { countWeeklyTimeSlots, studioScheduleSeedRows } from "@/lib/studio-schedule";

const healthy: MonitorSample = {
  homepageOk: true,
  bookOk: true,
  healthOk: true,
  serviceActive: true,
  diskUsedPercent: 40,
  memoryUsedPercent: 50,
  load15: 0.2,
  cpuCount: 2,
  upcomingBooked: 4,
  upcomingCapacity: 18,
};

describe("studio monitor", () => {
  it("stays quiet when the studio is healthy", () => {
    expect(evaluateMonitor(healthy)).toEqual([]);
  });

  it("flags downtime and high usage", () => {
    const issues = evaluateMonitor({
      ...healthy,
      serviceActive: false,
      diskUsedPercent: 91,
      upcomingBooked: 16,
      upcomingCapacity: 18,
    });
    expect(issues.map((issue) => issue.id)).toEqual([
      "service-down",
      "disk-high",
      "calendar-full",
    ]);
  });

  it("stays quiet just below the usage thresholds", () => {
    expect(
      evaluateMonitor({
        ...healthy,
        diskUsedPercent: 79,
        memoryUsedPercent: 87,
        load15: 2.9,
        cpuCount: 2,
        upcomingBooked: 14,
        upcomingCapacity: 18,
      })
    ).toEqual([]);
  });

  it("flags health, public pages, memory, and load", () => {
    const issues = evaluateMonitor({
      ...healthy,
      homepageOk: false,
      healthOk: false,
      memoryUsedPercent: 90,
      load15: 3.2,
      cpuCount: 2,
    });
    expect(issues.map((issue) => issue.id)).toEqual([
      "health-down",
      "public-down",
      "memory-high",
      "load-high",
    ]);
  });

  it("counts people per slot, not just time slots", () => {
    expect(upcomingPlacesCapacity(15, 3, 2)).toBe(90);
    expect(upcomingPlacesCapacity(0, 3, 2)).toBe(0);
    expect(upcomingPlacesCapacity(15, 0, 2)).toBe(0);
  });

  it("does not treat 49 people on a 15-slot week as 163% full", () => {
    const weeklyTimeSlots = countWeeklyTimeSlots(
      studioScheduleSeedRows().map((row) => ({
        ...row,
        lunchStart: row.lunchStart || "",
        lunchEnd: row.lunchEnd || "",
      }))
    );
    expect(weeklyTimeSlots).toBe(15);
    const upcomingCapacity = upcomingPlacesCapacity(weeklyTimeSlots, siteConfig.slotCapacity, 2);
    expect(upcomingCapacity).toBe(90);
    expect(
      evaluateMonitor({
        ...healthy,
        upcomingBooked: 49,
        upcomingCapacity,
      })
    ).toEqual([]);
  });

  it("still alerts when 80% of places are booked", () => {
    const issues = evaluateMonitor({
      ...healthy,
      upcomingBooked: 72,
      upcomingCapacity: 90,
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].id).toBe("calendar-full");
    expect(issues[0].detail).toBe("72 of 90 places are booked (80%).");
  });

  it("emails a new problem and a recovery, but not every check", () => {
    expect(shouldSendAlert(["disk-high"], [], null)).toEqual({ send: true, recovered: false });
    expect(shouldSendAlert(["disk-high"], ["disk-high"], new Date().toISOString())).toEqual({
      send: false,
      recovered: false,
    });
    expect(shouldSendAlert([], ["disk-high"], new Date().toISOString())).toEqual({
      send: true,
      recovered: true,
    });
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    expect(shouldSendAlert(["disk-high"], ["disk-high"], sixHoursAgo)).toEqual({
      send: true,
      recovered: false,
    });
  });
});
