import { isSameDay, isWithinInterval, startOfDay, getHours, getMinutes } from "date-fns";

export interface BlockedTime {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
}

export interface Appointment {
  id: string;
  scheduledAt: string;
  durationMin: number;
  status: string;
  client: { name: string; email: string };
  service: { name: string; durationMin: number };
}

export interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  lunchStart: string;
  lunchEnd: string;
  gapMinutes: number;
}

export type ViewMode = "month" | "week" | "day" | "agenda";

export const defaultSchedule: DaySchedule[] = [
  { dayOfWeek: 1, dayName: "Monday", isActive: false, startTime: "09:00", endTime: "17:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 2, dayName: "Tuesday", isActive: false, startTime: "09:00", endTime: "17:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 3, dayName: "Wednesday", isActive: false, startTime: "09:00", endTime: "17:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 4, dayName: "Thursday", isActive: false, startTime: "09:00", endTime: "17:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 5, dayName: "Friday", isActive: false, startTime: "09:00", endTime: "17:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 6, dayName: "Saturday", isActive: false, startTime: "09:00", endTime: "13:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 0, dayName: "Sunday", isActive: false, startTime: "09:00", endTime: "13:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
];

export function isAppointmentJoinable(scheduledAt: string, durationMin: number): boolean {
  const now = new Date();
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMin * 60000);

  const bufferStart = new Date(start.getTime() - 5 * 60000);
  const bufferEnd = new Date(end.getTime() + 10 * 60000);

  return now >= bufferStart && now <= bufferEnd;
}

export function getItemsForDay(
  date: Date,
  blockedTimes: BlockedTime[],
  appointments: Appointment[]
): { blocked: BlockedTime[]; appointments: Appointment[] } {
  const dayBlocked = blockedTimes.filter((bt) => {
    const start = new Date(bt.startDate);
    const end = new Date(bt.endDate);
    return (
      isWithinInterval(date, { start: startOfDay(start), end: startOfDay(end) }) ||
      isSameDay(date, start) ||
      isSameDay(date, end)
    );
  });

  const dayAppointments = appointments.filter((apt) => {
    return isSameDay(new Date(apt.scheduledAt), date);
  });

  return { blocked: dayBlocked, appointments: dayAppointments };
}

export function getHourAppointments(appointments: Appointment[], hour: number): Appointment[] {
  return appointments.filter((apt) => getHours(new Date(apt.scheduledAt)) === hour);
}

export function getAppointmentTopOffset(apt: Appointment, cellHeight: number): number {
  const aptStart = new Date(apt.scheduledAt);
  return (getMinutes(aptStart) / 60) * cellHeight;
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case "CONFIRMED":
      return { bg: "bg-[var(--primary)]", text: "text-white", border: "border-[var(--primary)]" };
    case "PENDING":
      return { bg: "bg-[var(--warning)]", text: "text-white", border: "border-[var(--warning)]" };
    case "COMPLETED":
      return { bg: "bg-[var(--success)]", text: "text-white", border: "border-[var(--success)]" };
    default:
      return { bg: "bg-[var(--border)]", text: "text-[var(--text-primary)]", border: "border-[var(--border)]" };
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "Confirmed";
    case "PENDING":
      return "Pending";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}
