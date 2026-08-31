"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";
import { format, getHours, getMinutes } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Appointment,
  BlockedTime,
  getItemsForDay,
  getStatusColor,
  getStatusLabel,
  isAppointmentJoinable,
} from "../utils/schedule-utils";
import { cn } from "@/lib/utils";

interface DayViewProps {
  currentDate: Date;
  blockedTimes: BlockedTime[];
  appointments: Appointment[];
}

const dayHours = Array.from({ length: 15 }, (_, i) => i + 7);

export function DayView({ currentDate, blockedTimes, appointments }: DayViewProps) {
  const { appointments: dayApts } = getItemsForDay(currentDate, blockedTimes, appointments);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b border-[var(--border)] p-4">
          <div className="text-sm text-[var(--text-muted)]">
            {format(currentDate, "EEEE", { locale: enUS })}
          </div>
          <div className="text-2xl font-bold">
            {format(currentDate, 'MMMM d', { locale: enUS })}
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {dayHours.map((hour) => {
            const hourApts = dayApts.filter(
              (apt) => getHours(new Date(apt.scheduledAt)) === hour
            );

            return (
              <div key={hour} className="flex">
                <div className="w-20 text-sm text-[var(--text-muted)] py-4 px-4 border-r border-[var(--border)]">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                <div className="flex-1 min-h-[64px] pl-4 py-2 relative">
                  {hourApts.map((apt) => {
                    const aptStart = new Date(apt.scheduledAt);
                    const topOffset = (getMinutes(aptStart) / 60) * 64;
                    const colors = getStatusColor(apt.status);

                    return (
                      <div
                        key={apt.id}
                        className={cn(
                          "absolute left-0 right-0 rounded-lg border-l-4 p-3 mx-2",
                          colors.bg.replace("bg-", "bg-").replace("]", "-light)]"),
                          colors.border
                        )}
                        style={{ top: `${topOffset}px` }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-[var(--text-primary)]">
                              {apt.client.name}
                            </div>
                            <div className="text-sm text-[var(--text-muted)]">
                              {apt.service.name} • {format(aptStart, "HH:mm")} -{" "}
                              {format(
                                new Date(aptStart.getTime() + apt.durationMin * 60000),
                                "HH:mm"
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={apt.status === "CONFIRMED" ? "default" : apt.status === "PENDING" ? "warning" : "success"}>
                              {getStatusLabel(apt.status)}
                            </Badge>
                            {(apt.status === "CONFIRMED" || apt.status === "IN_PROGRESS") &&
                              isAppointmentJoinable(apt.scheduledAt, apt.durationMin) && (
                                <Button size="sm" asChild>
                                  <Link href={`/call/${apt.id}`}>
                                    <Video className="w-4 h-4 mr-1" />
                                    Join
                                  </Link>
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
