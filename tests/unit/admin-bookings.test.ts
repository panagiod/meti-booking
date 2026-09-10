import { describe, expect, it } from "vitest";
import { firstOpenBookingDate, groupBookingsByStudioDate } from "@/lib/admin-bookings";

describe("groupBookingsByStudioDate", () => {
  it("groups upcoming bookings by studio calendar day", () => {
    const groups = groupBookingsByStudioDate([
      { scheduledAt: "2026-09-12T09:45:00.000Z", id: "b" },
      { scheduledAt: "2026-09-10T12:45:00.000Z", id: "a" },
      { scheduledAt: "2026-09-12T10:40:00.000Z", id: "c" },
    ]);
    expect(groups.map((group) => group.date)).toEqual(["2026-09-10", "2026-09-12"]);
    expect(groups[1].items.map((item) => item.id)).toEqual(["b", "c"]);
  });
});

describe("firstOpenBookingDate", () => {
  it("opens today or the next booked day", () => {
    expect(firstOpenBookingDate(["2026-09-09", "2026-09-12"], "2026-09-10")).toBe("2026-09-12");
    expect(firstOpenBookingDate(["2026-09-10", "2026-09-12"], "2026-09-10")).toBe("2026-09-10");
  });

  it("falls back to the first booked day when all dates are in the past", () => {
    expect(firstOpenBookingDate(["2026-09-01", "2026-09-02"], "2026-09-10")).toBe("2026-09-01");
  });
});
