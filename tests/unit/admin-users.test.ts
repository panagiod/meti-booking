import { describe, expect, it } from "vitest";
import {
  classifyAdminAppointment,
  countUnpaidCents,
  countYearClasses,
  filterAdminUsers,
  normalizeAdminUserRole,
  partitionAdminAppointments,
  sortAdminUsers,
  summarizeAdminUsers,
  type AdminUserListItem,
} from "@/lib/admin-users";

function user(
  partial: Partial<AdminUserListItem> & Pick<AdminUserListItem, "id" | "name" | "email" | "role">
): AdminUserListItem {
  return {
    appointments: 0,
    joinDate: "",
    phone: null,
    upcoming: [],
    recent: [],
    yearCount: 0,
    yearDates: [],
    unpaidCents: 0,
    ...partial,
  };
}

const users: AdminUserListItem[] = [
  user({ id: "1", name: "Owner", email: "barridasg@gmail.com", role: "ADMIN" }),
  user({
    id: "2",
    name: "Meropi",
    email: "tyrri_meropi@hotmail.com",
    role: "instructor",
    upcoming: [
      {
        id: "a1",
        scheduledAt: "2026-10-01T12:45:00.000Z",
        status: "CONFIRMED",
        serviceName: "Reformer Session",
        durationMin: 45,
      },
    ],
  }),
  user({
    id: "3",
    name: "Alex",
    email: "alex@example.com",
    role: "client",
    phone: "+35795500000",
    upcoming: [
      {
        id: "a2",
        scheduledAt: "2026-09-12T05:00:00.000Z",
        status: "CONFIRMED",
        serviceName: "Reformer Session",
        durationMin: 45,
      },
    ],
    recent: [
      {
        id: "a3",
        scheduledAt: "2026-09-04T12:45:00.000Z",
        status: "COMPLETED",
        serviceName: "Reformer Session",
        durationMin: 45,
        totalCents: 3500,
        paidAt: null,
        paidByName: null,
      },
    ],
    unpaidCents: 3500,
  }),
];

describe("summarizeAdminUsers", () => {
  it("counts roles from the full list, not a filtered subset", () => {
    expect(summarizeAdminUsers(users)).toEqual({
      total: 3,
      clients: 1,
      admins: 1,
      instructors: 1,
    });
  });
});

describe("filterAdminUsers", () => {
  it("does not change overall totals when searching", () => {
    const visible = filterAdminUsers(users, { search: "alex" });
    expect(visible.map((item) => item.id)).toEqual(["3"]);
    expect(summarizeAdminUsers(users).total).toBe(3);
  });

  it("filters by role without treating instructors as clients", () => {
    expect(filterAdminUsers(users, { role: "client" })).toHaveLength(1);
    expect(filterAdminUsers(users, { role: "admin" })).toHaveLength(1);
    expect(filterAdminUsers(users, { role: "instructor" })).toHaveLength(1);
  });

  it("filters people who have an upcoming session", () => {
    expect(filterAdminUsers(users, { bookings: "upcoming" }).map((item) => item.id)).toEqual([
      "2",
      "3",
    ]);
    expect(filterAdminUsers(users, { bookings: "none" }).map((item) => item.id)).toEqual(["1"]);
  });

  it("filters people who still owe for a completed session", () => {
    expect(filterAdminUsers(users, { bookings: "unpaid" }).map((item) => item.id)).toEqual(["3"]);
  });

  it("searches phone numbers", () => {
    expect(filterAdminUsers(users, { search: "95500000" }).map((item) => item.id)).toEqual(["3"]);
  });
});

describe("normalizeAdminUserRole", () => {
  it("maps stored roles to the admin UI roles", () => {
    expect(normalizeAdminUserRole("ADMIN")).toBe("admin");
    expect(normalizeAdminUserRole("INSTRUCTOR")).toBe("instructor");
    expect(normalizeAdminUserRole("advisor")).toBe("instructor");
    expect(normalizeAdminUserRole("CLIENT")).toBe("client");
  });
});

describe("partitionAdminAppointments", () => {
  const now = new Date("2026-09-05T12:00:00.000Z");

  it("keeps future confirmed sessions as upcoming and older ones as recent", () => {
    const result = partitionAdminAppointments(
      [
        {
          id: "past",
          scheduledAt: "2026-09-01T12:45:00.000Z",
          status: "COMPLETED",
          serviceName: "Reformer Session",
          durationMin: 45,
        },
        {
          id: "next",
          scheduledAt: "2026-09-12T05:00:00.000Z",
          status: "CONFIRMED",
          serviceName: "Reformer Session",
          durationMin: 45,
        },
        {
          id: "cancelled",
          scheduledAt: "2026-09-19T05:00:00.000Z",
          status: "CANCELLED",
          serviceName: "Reformer Session",
          durationMin: 45,
        },
        {
          id: "test",
          scheduledAt: "2026-09-12T06:00:00.000Z",
          status: "CONFIRMED",
          serviceName: "Reformer Session",
          durationMin: 45,
          isTest: true,
        },
      ],
      now
    );

    expect(result.upcoming.map((item) => item.id)).toEqual(["next"]);
    expect(result.recent.map((item) => item.id)).toEqual(["cancelled", "past"]);
  });

  it("shows at most eight past sessions on a client card", () => {
    const past = Array.from({ length: 12 }, (_, index) => ({
      id: `past-${index}`,
      scheduledAt: `2026-08-${String(index + 1).padStart(2, "0")}T12:45:00.000Z`,
      status: "COMPLETED",
      serviceName: "Reformer Session",
      durationMin: 45,
    }));
    expect(partitionAdminAppointments(past, now).recent).toHaveLength(8);
  });

  it("keeps unpaid completed sessions even when they are older than the last eight", () => {
    const past = Array.from({ length: 12 }, (_, index) => ({
      id: `past-${index}`,
      scheduledAt: `2026-08-${String(index + 1).padStart(2, "0")}T12:45:00.000Z`,
      status: "COMPLETED",
      serviceName: "Reformer Session",
      durationMin: 45,
      totalCents: 3500,
      paidAt: index < 4 ? null : "2026-09-01T12:00:00.000Z",
    }));
    const recent = partitionAdminAppointments(past, now).recent;
    expect(recent).toHaveLength(12);
    expect(recent.filter((item) => item.paidAt === null).map((item) => item.id)).toEqual([
      "past-3",
      "past-2",
      "past-1",
      "past-0",
    ]);
  });
});

describe("classifyAdminAppointment", () => {
  it("treats a late cancel as cancelled, not upcoming", () => {
    expect(
      classifyAdminAppointment(
        { scheduledAt: "2026-09-12T05:00:00.000Z", status: "CANCELLED" },
        new Date("2026-09-05T12:00:00.000Z")
      )
    ).toBe("cancelled");
  });
});

describe("sortAdminUsers", () => {
  it("puts the soonest upcoming client first", () => {
    expect(sortAdminUsers(users).map((item) => item.id)).toEqual(["3", "2", "1"]);
  });
});

describe("countYearClasses", () => {
  it("sums completed classes from the year log", () => {
    expect(
      countYearClasses([
        { ...users[0], yearCount: 2 },
        { ...users[2], yearCount: 12 },
      ])
    ).toBe(14);
  });
});

describe("countUnpaidCents", () => {
  it("sums unpaid session totals across clients", () => {
    expect(countUnpaidCents(users)).toBe(3500);
  });
});
