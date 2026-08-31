"use client";

import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isBefore,
  startOfDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DaySlots } from "@/lib/slots";

interface CalendarPickerProps {
  availableDates: DaySlots[];
  selectedDate: DaySlots | null;
  onSelect: (date: DaySlots) => void;
}

export function CalendarPicker({
  availableDates,
  selectedDate,
  onSelect,
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const availableDatesMap = new Map(availableDates.map((d) => [d.dateStr, d]));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl text-[var(--studio-ink)]">Pick a date</h2>
        <p className="mt-2 text-[var(--studio-muted)]">When would you like to come in?</p>
      </div>

      <div className="rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-full p-2 text-[var(--studio-muted)] transition hover:bg-[var(--studio-warm)] hover:text-[var(--studio-ink)]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-display text-xl capitalize text-[var(--studio-ink)]">
            {format(currentMonth, "MMMM yyyy", { locale: enUS })}
          </h3>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-full p-2 text-[var(--studio-muted)] transition hover:bg-[var(--studio-warm)] hover:text-[var(--studio-ink)]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {dayNames.map((day) => (
            <div key={day} className="py-2 text-center text-xs text-[var(--studio-muted)]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {monthDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayData = availableDatesMap.get(dateStr);
            const isAvailable = dayData?.hasAvailability ?? false;
            const isSelected = selectedDate?.dateStr === dateStr;
            const isPast = isBefore(day, startOfDay(new Date()));
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={dateStr}
                type="button"
                disabled={!isAvailable || isPast || !isCurrentMonth}
                onClick={() => dayData && onSelect(dayData)}
                className={cn(
                  "h-10 rounded-lg text-sm transition",
                  !isCurrentMonth && "text-transparent",
                  isCurrentMonth && !isAvailable && "text-[var(--studio-muted)]/40",
                  isCurrentMonth &&
                    isAvailable &&
                    !isSelected &&
                    "text-[var(--studio-ink)] hover:bg-[var(--studio-warm)]",
                  isSelected && "bg-[var(--studio-ink)] text-white",
                  isPast && "text-[var(--studio-muted)]/30"
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
