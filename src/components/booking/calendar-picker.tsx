"use client";

import { useEffect, useState } from "react";
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
  isAfter,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DaySlots } from "@/lib/slots";
import {
  formatMessage,
  useLocale,
  useTranslations,
} from "@/components/providers/locale-provider";
import { formatGreekDate, getDateFnsLocale } from "@/lib/date-locale";

interface CalendarPickerProps {
  availableDates: DaySlots[];
  selectedDate: DaySlots | null;
  onSelect: (date: DaySlots) => void;
  isLoading?: boolean;
}

export function CalendarPicker({
  availableDates,
  selectedDate,
  onSelect,
  isLoading = false,
}: CalendarPickerProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const dateFnsLocale = getDateFnsLocale(locale);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [didJumpToAvailability, setDidJumpToAvailability] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dayNames =
    locale === "el"
      ? ["Δευ", "Τρί", "Τετ", "Πέμ", "Παρ", "Σάβ", "Κυρ"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const availableDatesMap = new Map(availableDates.map((d) => [d.dateStr, d]));

  useEffect(() => {
    if (didJumpToAvailability) return;
    const firstAvailable = availableDates.find((d) => d.hasAvailability);
    if (!firstAvailable) return;
    setDidJumpToAvailability(true);
    setCurrentMonth(startOfMonth(firstAvailable.date));
  }, [availableDates, didJumpToAvailability]);

  const minDate = availableDates[0]?.date;
  const maxDate = availableDates[availableDates.length - 1]?.date;
  const nextOpen = availableDates.find((day) => day.hasAvailability);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="font-display text-2xl text-[var(--studio-ink)] sm:text-3xl">
          {t.booking.pickDate}
        </h2>
        <p className="mt-2 text-sm text-[var(--studio-muted)] sm:text-base">
          {t.booking.pickDateSub}
        </p>
        {nextOpen && (
          <p className="mt-3 rounded-xl bg-[var(--studio-warm)] px-3 py-2 text-sm text-[var(--studio-ink)]">
            {formatMessage(t.booking.nextOpenDay, {
              date: format(nextOpen.date, "EEEE d MMMM", { locale: dateFnsLocale }),
            })}
          </p>
        )}
        {isLoading && (
          <p className="mt-2 text-xs text-[var(--studio-muted)]">Loading availability…</p>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            disabled={
              minDate ? !isAfter(startOfMonth(currentMonth), startOfMonth(minDate)) : false
            }
            className="rounded-full p-2 text-[var(--studio-muted)] transition hover:bg-[var(--studio-warm)] hover:text-[var(--studio-ink)] disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-display text-xl text-[var(--studio-ink)]">
            {locale === "el"
              ? formatGreekDate(currentMonth, "monthYear")
              : format(currentMonth, "MMMM yyyy", { locale: dateFnsLocale })}
          </h3>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            disabled={
              maxDate ? !isBefore(startOfMonth(currentMonth), startOfMonth(maxDate)) : false
            }
            className="rounded-full p-2 text-[var(--studio-muted)] transition hover:bg-[var(--studio-warm)] hover:text-[var(--studio-ink)] disabled:opacity-30"
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

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
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
                  "flex h-11 items-center justify-center rounded-lg text-sm transition sm:h-10",
                  !isCurrentMonth && "text-transparent",
                  isCurrentMonth && !isAvailable && "text-[var(--studio-muted)]/35",
                  isCurrentMonth &&
                    isAvailable &&
                    !isSelected &&
                    "bg-[var(--studio-warm)] font-semibold text-[var(--studio-ink)] hover:bg-[var(--studio-line)]",
                  isSelected && "bg-[var(--studio-ink)] font-semibold text-white",
                  isPast && !isAvailable && "text-[var(--studio-muted)]/25"
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
