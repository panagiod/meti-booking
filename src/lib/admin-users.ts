export type AdminUserRole = "admin" | "client" | "instructor";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  appointments: number;
  joinDate: string;
}

export function normalizeAdminUserRole(role: string | null | undefined): AdminUserRole {
  const value = role?.trim().toLowerCase();
  if (value === "admin") return "admin";
  if (value === "instructor" || value === "advisor") return "instructor";
  return "client";
}

export function summarizeAdminUsers(users: Array<{ role: string }>) {
  let clients = 0;
  let admins = 0;
  let instructors = 0;

  for (const user of users) {
    const role = normalizeAdminUserRole(user.role);
    if (role === "admin") admins += 1;
    else if (role === "instructor") instructors += 1;
    else clients += 1;
  }

  return {
    total: users.length,
    clients,
    admins,
    instructors,
  };
}

export function filterAdminUsers(
  users: AdminUserListItem[],
  params: { role?: string; search?: string }
): AdminUserListItem[] {
  const roleFilter = params.role?.trim().toLowerCase();
  const search = params.search?.trim().toLowerCase();

  return users.filter((user) => {
    const role = normalizeAdminUserRole(user.role);
    if (roleFilter && roleFilter !== "all" && role !== roleFilter) {
      return false;
    }
    if (!search) return true;
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });
}
