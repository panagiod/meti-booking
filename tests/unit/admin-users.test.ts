import { describe, expect, it } from "vitest";
import {
  classifyAdminAppointment,
  countUpcomingSessions,
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
      },
    ],
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

describe("countUpcomingSessions", () => {
  it("sums upcoming dates across people", () => {
    expect(countUpcomingSessions(users)).toBe(2);
  });
});
