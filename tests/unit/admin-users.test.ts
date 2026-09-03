import { describe, expect, it } from "vitest";
import {
  filterAdminUsers,
  normalizeAdminUserRole,
  summarizeAdminUsers,
  type AdminUserListItem,
} from "@/lib/admin-users";

const users: AdminUserListItem[] = [
  { id: "1", name: "Owner", email: "barridasg@gmail.com", role: "ADMIN", appointments: 0, joinDate: "" },
  { id: "2", name: "Meropi", email: "tyrri_meropi@hotmail.com", role: "instructor", appointments: 2, joinDate: "" },
  { id: "3", name: "Alex", email: "alex@example.com", role: "client", appointments: 1, joinDate: "" },
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
    expect(visible.map((user) => user.id)).toEqual(["3"]);
    expect(summarizeAdminUsers(users).total).toBe(3);
  });

  it("filters by role without treating instructors as clients", () => {
    expect(filterAdminUsers(users, { role: "client" })).toHaveLength(1);
    expect(filterAdminUsers(users, { role: "admin" })).toHaveLength(1);
    expect(filterAdminUsers(users, { role: "instructor" })).toHaveLength(1);
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
