"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar, Video } from "lucide-react";
import { format } from "date-fns";
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

interface AgendaViewProps {
  calendarDays: Date[];
  blockedTimes: BlockedTime[];
  appointments: Appointment[];
}

export function AgendaView({ calendarDays, blockedTimes, appointments }: AgendaViewProps) {
  const hasEvents = calendarDays.some((day) => {
    const { blocked, appointments: apts } = getItemsForDay(day, blockedTimes, appointments);
    return blocked.length > 0 || apts.length > 0;
  });

  if (!hasEvents) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0 divide-y divide-[var(--border)]">
          <div className="p-8">
            <EmptyState
              icon={Calendar}
              title="No events"
              description="There are no appointments or blocks in this period."
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 divide-y divide-[var(--border)]">
        {calendarDays.map((day) => {
          const { blocked, appointments: apts } = getItemsForDay(day, blockedTimes, appointments);
          if (blocked.length === 0 && apts.length === 0) return null;

          return (
            <div key={day.toISOString()}>
              <div className="px-4 py-2 bg-[var(--background)] border-b border-[var(--border)]">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {format(day, "d 'de' MMMM", { locale: enUS }).toUpperCase()}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {format(day, "EEEE", { locale: enUS })}
                </div>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {blocked.map((bt) => (
                  <div
                    key={bt.id}
                    className="px-4 py-3 bg-[var(--error-light)] border-l-4 border-[var(--error)]"
                  >
                    <div className="font-medium text-[var(--text-primary)]">{bt.title}</div>
                    <div className="text-sm text-[var(--text-muted)]">
                      {bt.isAllDay
                        ? "All day"
                        : `${format(new Date(bt.startDate), "HH:mm")} - ${format(new Date(bt.endDate), "HH:mm")}`}
                    </div>
                  </div>
                ))}

                {apts.map((apt) => {
                  const colors = getStatusColor(apt.status);
                  return (
                    <div
                      key={apt.id}
                      className={cn(
                        "px-4 py-3 border-l-4",
                        colors.bg.replace("bg-", "bg-").replace("]", "-light)]"),
                        colors.border
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-[var(--text-primary)]">
                            {apt.client.name}
                          </div>
                          <div className="text-sm text-[var(--text-muted)]">
                            {apt.service.name} •{" "}
                            {format(new Date(apt.scheduledAt), "HH:mm")} -{" "}
                            {format(
                              new Date(
                                new Date(apt.scheduledAt).getTime() + apt.durationMin * 60000
                              ),
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
      </CardContent>
    </Card>
  );
}
