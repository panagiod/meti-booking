import { describe, expect, it } from "vitest";
import { idsToComplete, sessionHasEnded, COMPLETED_RETENTION_DAYS, completedRetentionCutoff } from "@/lib/appointment-complete";

const start = new Date("2026-09-10T12:45:00Z");

describe("sessionHasEnded", () => {
  it("is false while the class is still running", () => {
    expect(sessionHasEnded(start, 45, new Date("2026-09-10T13:29:00Z"))).toBe(false);
  });

  it("is true when the class end time has passed", () => {
    expect(sessionHasEnded(start, 45, new Date("2026-09-10T13:30:00Z"))).toBe(true);
    expect(sessionHasEnded(start, 45, new Date("2026-09-10T14:00:00Z"))).toBe(true);
  });
});

describe("idsToComplete", () => {
  it("completes only sessions whose duration has finished", () => {
    const rows = [
      { id: "running", scheduledAt: start, durationMin: 45 },
      { id: "done", scheduledAt: new Date("2026-09-10T11:00:00Z"), durationMin: 45 },
    ];
    expect(idsToComplete(rows, new Date("2026-09-10T13:10:00Z"))).toEqual(["done"]);
  });
});

describe("completed retention", () => {
  it("keeps completed classes for 12 months", () => {
    expect(COMPLETED_RETENTION_DAYS).toBe(365);
    const now = new Date("2026-09-10T12:00:00Z");
    const cutoff = completedRetentionCutoff(now);
    expect(now.getTime() - cutoff.getTime()).toBe(365 * 24 * 60 * 60 * 1000);
  });
});
