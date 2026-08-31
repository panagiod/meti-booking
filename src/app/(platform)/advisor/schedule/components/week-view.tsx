"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format, isToday, getHours, getMinutes } from "date-fns";
import { enUS } from "date-fns/locale";
import { Appointment, BlockedTime, getItemsForDay, getStatusColor } from "../utils/schedule-utils";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  calendarDays: Date[];
  blockedTimes: BlockedTime[];
  appointments: Appointment[];
}

const dayHours = Array.from({ length: 15 }, (_, i) => i + 7);

export function WeekView({ calendarDays, blockedTimes, appointments }: WeekViewProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-8 border-b border-[var(--border)]">
            <div className="w-16" />
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={cn(
                  "text-center py-3 border-r last:border-r-0 border-[var(--border)]",
                  isToday(day) && "bg-[var(--primary-light)]"
                )}
              >
                <div className="text-xs text-[var(--text-muted)]">
                  {format(day, "EEE", { locale: enUS })}
                </div>
                <div
                  className={cn(
                    "text-lg font-semibold mt-0.5",
                    isToday(day) && "text-[var(--primary)]"
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            {dayHours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-[var(--border)]">
                <div className="w-16 text-xs text-[var(--text-muted)] py-3 px-2 border-r border-[var(--border)]">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {calendarDays.map((day, dayIdx) => {
                  const { appointments: dayApts } = getItemsForDay(day, blockedTimes, appointments);
                  const hourApts = dayApts.filter(
                    (apt) => getHours(new Date(apt.scheduledAt)) === hour
                  );

                  return (
                    <div
                      key={dayIdx}
                      className="relative min-h-[48px] border-r last:border-r-0 border-[var(--border)] p-0.5"
                    >
                      {hourApts.map((apt) => {
                        const aptStart = new Date(apt.scheduledAt);
                        const topOffset = (getMinutes(aptStart) / 60) * 48;
                        const colors = getStatusColor(apt.status);

                        return (
                          <div
                            key={apt.id}
                            className={cn(
                              "block absolute inset-x-0.5 rounded text-xs px-1.5 py-1 overflow-hidden",
                              colors.bg,
                              colors.text
                            )}
                            style={{
                              top: `${topOffset}px`,
                              height: `${(apt.durationMin / 60) * 48}px`,
                            }}
                          >
                            <div className="font-medium truncate">{apt.client.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
