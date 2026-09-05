export type AdminUserRole = "admin" | "client" | "instructor";
export type AdminUserBookingFilter = "all" | "upcoming" | "none";

export interface AdminUserAppointment {
  id: string;
  scheduledAt: string;
  status: string;
  serviceName: string;
  durationMin: number;
  isTest?: boolean;
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  appointments: number;
  joinDate: string;
  upcoming: AdminUserAppointment[];
  recent: AdminUserAppointment[];
}

const ACTIVE_STATUSES = new Set(["PENDING", "CONFIRMED", "IN_PROGRESS"]);

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

export function classifyAdminAppointment(
  appointment: Pick<AdminUserAppointment, "scheduledAt" | "status">,
  now = new Date()
): "upcoming" | "past" | "cancelled" {
  const status = appointment.status.trim().toUpperCase();
  if (status === "CANCELLED") return "cancelled";
  if (ACTIVE_STATUSES.has(status) && new Date(appointment.scheduledAt).getTime() >= now.getTime()) {
    return "upcoming";
  }
  return "past";
}

export function partitionAdminAppointments(
  appointments: AdminUserAppointment[],
  now = new Date()
): { upcoming: AdminUserAppointment[]; recent: AdminUserAppointment[] } {
  const upcoming: AdminUserAppointment[] = [];
  const recent: AdminUserAppointment[] = [];

  for (const appointment of appointments) {
    if (appointment.isTest) continue;
    const kind = classifyAdminAppointment(appointment, now);
    if (kind === "upcoming") upcoming.push(appointment);
    else recent.push(appointment);
  }

  upcoming.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  recent.sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  return { upcoming, recent: recent.slice(0, 8) };
}

export function sortAdminUsers(users: AdminUserListItem[]): AdminUserListItem[] {
  return [...users].sort((a, b) => {
    const aNext = a.upcoming[0]?.scheduledAt;
    const bNext = b.upcoming[0]?.scheduledAt;
    if (aNext && bNext) return aNext.localeCompare(bNext);
    if (aNext) return -1;
    if (bNext) return 1;

    const aLast = a.recent[0]?.scheduledAt;
    const bLast = b.recent[0]?.scheduledAt;
    if (aLast && bLast) return bLast.localeCompare(aLast);
    if (aLast) return -1;
    if (bLast) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function countUpcomingSessions(users: AdminUserListItem[]): number {
  return users.reduce((sum, user) => sum + user.upcoming.length, 0);
}

export function appointmentStatusLabel(status: string): string {
  const value = status.trim().toUpperCase();
  if (value === "CONFIRMED") return "Confirmed";
  if (value === "PENDING") return "Pending";
  if (value === "IN_PROGRESS") return "In session";
  if (value === "COMPLETED") return "Done";
  if (value === "CANCELLED") return "Cancelled";
  if (value === "NO_SHOW") return "No-show";
  return status;
}

export function filterAdminUsers(
  users: AdminUserListItem[],
  params: { role?: string; search?: string; bookings?: AdminUserBookingFilter }
): AdminUserListItem[] {
  const roleFilter = params.role?.trim().toLowerCase();
  const search = params.search?.trim().toLowerCase();
  const bookings = params.bookings ?? "all";

  return users.filter((user) => {
    const role = normalizeAdminUserRole(user.role);
    if (roleFilter && roleFilter !== "all" && role !== roleFilter) {
      return false;
    }
    if (bookings === "upcoming" && user.upcoming.length === 0) return false;
    if (bookings === "none" && user.upcoming.length > 0) return false;
    if (!search) return true;
    const haystack = [
      user.name,
      user.email,
      user.phone ?? "",
      ...user.upcoming.map((item) => item.serviceName),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(search);
  });
}
