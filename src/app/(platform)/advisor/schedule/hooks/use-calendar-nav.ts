import { useState, useCallback, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import { Appointment, ViewMode } from "../utils/schedule-utils";

export function useCalendarNav() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const navigatePrev = useCallback(() => {
    setCurrentDate((prev) => {
      if (viewMode === "month") return subMonths(prev, 1);
      if (viewMode === "week") return subWeeks(prev, 1);
      return subDays(prev, 1);
    });
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    setCurrentDate((prev) => {
      if (viewMode === "month") return addMonths(prev, 1);
      if (viewMode === "week") return addWeeks(prev, 1);
      return addDays(prev, 1);
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToDay = useCallback((day: Date) => {
    setCurrentDate(day);
    setViewMode("day");
  }, []);

  const calendarDays = useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: calStart, end: calEnd });
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    } else if (viewMode === "agenda") {
      const agendaStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: agendaStart, end: addWeeks(agendaStart, 2) });
    } else {
      return [currentDate];
    }
  }, [viewMode, currentDate]);

  const fetchAppointments = useCallback(async () => {
    try {
      let startDate: Date;
      let endDate: Date;

      if (viewMode === "month") {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      } else if (viewMode === "week") {
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
      } else if (viewMode === "agenda") {
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        endDate = addWeeks(startDate, 2);
      } else {
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
      }

      const res = await fetch(
        `/api/advisor/appointments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        { credentials: "include" }
      );

      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }, [viewMode, currentDate]);

  return {
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    appointments,
    calendarDays,
    navigatePrev,
    navigateNext,
    goToToday,
    goToDay,
    fetchAppointments,
  };
}
