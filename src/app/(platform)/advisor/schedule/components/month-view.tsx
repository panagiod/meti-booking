"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format, isSameMonth, isToday } from "date-fns";
import { enUS } from "date-fns/locale";
import { Appointment, BlockedTime, getItemsForDay, getStatusColor } from "../utils/schedule-utils";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  calendarDays: Date[];
  currentDate: Date;
  blockedTimes: BlockedTime[];
  appointments: Appointment[];
  onDayClick: (day: Date) => void;
}

export function MonthView({
  calendarDays,
  currentDate,
  blockedTimes,
  appointments,
  onDayClick,
}: MonthViewProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b border-[var(--border)]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-[var(--text-muted)] py-3 border-r last:border-r-0 border-[var(--border)]"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const { blocked, appointments: apts } = getItemsForDay(day, blockedTimes, appointments);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const colors = getStatusColor("CONFIRMED");

            return (
              <div
                key={idx}
                onClick={() => onDayClick(day)}
                className={cn(
                  "min-h-[100px] p-2 border-r border-b border-[var(--border)] last:border-r-0 cursor-pointer hover:bg-[var(--background)] transition-colors",
                  !isCurrentMonth && "opacity-40",
                  isCurrentDay && "bg-[var(--primary-light)]"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCurrentDay &&
                        "bg-[var(--primary)] text-white w-6 h-6 rounded-full flex items-center justify-center"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {blocked.slice(0, 1).map((bt) => (
                    <div
                      key={bt.id}
                      className="text-[10px] px-1 py-0.5 rounded bg-[var(--error)] text-white truncate"
                    >
                      {bt.title}
                    </div>
                  ))}
                  {apts.slice(0, 2).map((apt) => {
                    const aptColors = getStatusColor(apt.status);
                    return (
                      <div
                        key={apt.id}
                        className={cn(
                          "block text-[10px] px-1 py-0.5 rounded truncate",
                          aptColors.bg,
                          aptColors.text
                        )}
                      >
                        {format(new Date(apt.scheduledAt), "HH:mm")} {apt.client.name}
                      </div>
                    );
                  })}
                  {blocked.length + apts.length > 3 && (
                    <div className="text-[10px] text-[var(--text-muted)] pl-1">
                      +{blocked.length + apts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
