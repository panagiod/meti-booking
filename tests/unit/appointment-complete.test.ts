import { describe, expect, it } from "vitest";
import { idsToComplete, sessionHasEnded, COMPLETED_HISTORY_LIMIT, idsBeyondCompletedHistoryLimit } from "@/lib/appointment-complete";

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

describe("completed history limit", () => {
  it("keeps the same eight completed classes admin can see", () => {
    expect(COMPLETED_HISTORY_LIMIT).toBe(8);
    const rows = Array.from({ length: 10 }, (_, index) => ({
      id: `c${index}`,
      clientId: "alex",
      scheduledAt: new Date(`2026-09-${String(index + 1).padStart(2, "0")}T12:45:00Z`),
    }));
    expect(idsBeyondCompletedHistoryLimit(rows).sort()).toEqual(["c0", "c1"]);
  });

  it("does not delete another client's recent classes", () => {
    const rows = [
      { id: "a-old", clientId: "a", scheduledAt: new Date("2026-01-01T12:00:00Z") },
      { id: "b-new", clientId: "b", scheduledAt: new Date("2026-09-01T12:00:00Z") },
    ];
    expect(idsBeyondCompletedHistoryLimit(rows, 8)).toEqual([]);
  });
});
