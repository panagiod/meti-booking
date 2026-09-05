"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCyprusHoliday } from "@/lib/cyprus-holidays";
import { generateAvailableSlots } from "@/lib/slots";
import { siteConfig } from "@/lib/site-config";
import type { StudioDaySchedule } from "@/lib/studio-schedule";
import {
  addStudioDays,
  formatStudioTime,
  getDayOfWeekForStudioDate,
  studioDateStrFromUtc,
  studioWeekStartDateStr,
  weekBoundsIso,
} from "@/lib/timezone";
import { cn } from "@/lib/utils";

export interface AdminBoardBooking {
  id: string;
  scheduledAt: string;
  status: string;
  clientName: string;
  clientEmail: string;
}

export interface AdminBoardBlockedTime {
  startDate: string;
  endDate: string;
  isAllDay?: boolean;
}

interface AdminWeekBoardProps {
  schedules: StudioDaySchedule[];
  bookings: AdminBoardBooking[];
  durationMin: number;
  slotCapacity: number;
  blockedTimes?: AdminBoardBlockedTime[];
  isLoadingBookings?: boolean;
  onWeekChange?: (startIso: string, endIso: string) => void;
  onCancel?: (bookingId: string) => void;
}

function dateLabel(dateStr: string, pattern: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return format(new Date(year, month - 1, day, 12, 0, 0), pattern);
}

export function AdminWeekBoard({
  schedules,
  bookings,
  durationMin,
  slotCapacity,
  blockedTimes = [],
  isLoadingBookings = false,
  onWeekChange,
  onCancel,
}: AdminWeekBoardProps) {
  const [weekStartStr, setWeekStartStr] = useState(() => studioWeekStartDateStr());

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addStudioDays(weekStartStr, index)),
    [weekStartStr]
  );

  const scheduleByDay = useMemo(
    () => new Map(schedules.filter((day) => day.isActive).map((day) => [day.dayOfWeek, day])),
    [schedules]
  );

  const mappedBlocks = useMemo(
    () =>
      blockedTimes.map((block) => ({
        startDate: new Date(block.startDate),
        endDate: new Date(block.endDate),
        isAllDay: block.isAllDay ?? true,
      })),
    [blockedTimes]
  );

  useEffect(() => {
    if (!onWeekChange) return;
    const { start, end } = weekBoundsIso(weekStartStr);
    onWeekChange(start, end);
  }, [weekStartStr, onWeekChange]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">Week schedule</CardTitle>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Open slots and bookings in Nicosia, Cyprus
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setWeekStartStr((prev) => addStudioDays(prev, -7))}
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setWeekStartStr(studioWeekStartDateStr())}
          >
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setWeekStartStr((prev) => addStudioDays(prev, 7))}
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4", isLoadingBookings && "opacity-60")}>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {dateLabel(weekStartStr, "d MMM")} – {dateLabel(addStudioDays(weekStartStr, 6), "d MMM yyyy")}
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {days.map((dateStr) => {
            const holiday = getCyprusHoliday(dateStr);
            const daySchedule = scheduleByDay.get(getDayOfWeekForStudioDate(dateStr));
            const dayBookings = bookings.filter(
              (booking) => studioDateStrFromUtc(new Date(booking.scheduledAt)) === dateStr
            );
            const [year, month, day] = dateStr.split("-").map(Number);
            const slotDate = new Date(year, month - 1, day, 12, 0, 0);
            const slots = daySchedule
              ? generateAvailableSlots(
                  daySchedule,
                  durationMin,
                  dayBookings.map((booking) => {
                    const start = new Date(booking.scheduledAt);
                    return { start, end: new Date(start.getTime() + durationMin * 60_000) };
                  }),
                  mappedBlocks,
                  slotDate,
                  undefined,
                  slotCapacity || siteConfig.slotCapacity
                )
              : [];

            return (
              <div key={dateStr} className="rounded-xl border border-[var(--border)] p-3">
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <p className="font-medium text-[var(--text-primary)]">{dateLabel(dateStr, "EEE d MMM")}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {holiday
                      ? "Holiday"
                      : daySchedule
                        ? `${daySchedule.startTime}–${daySchedule.endTime}`
                        : "Closed"}
                  </p>
                </div>
                {holiday ? (
                  <div className="space-y-2">
                    <p className="text-sm italic text-[var(--text-muted)]">
                      {holiday.name} — closed
                    </p>
                    {dayBookings.length > 0 && (
                      <ul className="space-y-2">
                        {dayBookings.map((booking) => (
                          <BookingRow key={booking.id} booking={booking} onCancel={onCancel} showTime />
                        ))}
                      </ul>
                    )}
                  </div>
                ) : !daySchedule ? (
                  dayBookings.length === 0 ? (
                    <p className="text-sm italic text-[var(--text-muted)]">Studio closed</p>
                  ) : (
                    <ul className="space-y-2">
                      {dayBookings.map((booking) => (
                        <BookingRow key={booking.id} booking={booking} onCancel={onCancel} showTime />
                      ))}
                    </ul>
                  )
                ) : slots.length === 0 ? (
                  <p className="text-sm italic text-[var(--text-muted)]">No slots this day</p>
                ) : (
                  <ul className="space-y-2">
                    {slots.map((slot) => {
                      const slotBookings = dayBookings.filter(
                        (booking) => formatStudioTime(new Date(booking.scheduledAt)) === slot.time
                      );
                      return (
                        <li key={`${dateStr}-${slot.time}`} className="rounded-lg bg-[var(--background)] p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-[var(--text-primary)]">{slot.time}</span>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                slot.booked >= slot.capacity
                                  ? "text-[var(--error,#b91c1c)]"
                                  : "text-[var(--text-muted)]"
                              )}
                            >
                              {slot.booked}/{slot.capacity}
                            </span>
                          </div>
                          {slotBookings.length === 0 ? (
                            <p className="mt-1 text-xs text-[var(--text-muted)]">Open</p>
                          ) : (
                            <ul className="mt-1 space-y-1">
                              {slotBookings.map((booking) => (
                                <BookingRow key={booking.id} booking={booking} onCancel={onCancel} />
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function BookingRow({
  booking,
  onCancel,
  showTime = false,
}: {
  booking: AdminBoardBooking;
  onCancel?: (bookingId: string) => void;
  showTime?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-2 text-xs">
      <span className="truncate text-[var(--text-primary)]">
        {showTime ? `${formatStudioTime(new Date(booking.scheduledAt))} ` : ""}
        {booking.clientName}
        <span className="text-[var(--text-muted)]"> · {booking.status.toLowerCase()}</span>
      </span>
      {onCancel && booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && (
        <button
          type="button"
          className="shrink-0 text-[var(--primary)] underline-offset-2 hover:underline"
          onClick={() => onCancel(booking.id)}
        >
          Free
        </button>
      )}
    </li>
  );
}
