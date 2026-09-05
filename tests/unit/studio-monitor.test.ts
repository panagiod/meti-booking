import { describe, expect, it } from "vitest";
import { evaluateMonitor, shouldSendAlert, type MonitorSample } from "@/lib/studio-monitor";

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
