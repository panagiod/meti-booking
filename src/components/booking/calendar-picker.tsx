"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  // Get day names
  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Create a map of available dates for quick lookup
  const availableDatesMap = new Map(
    availableDates.map((d) => [d.dateStr, d])
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">
          Selecciona una fecha
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Elige el día de tu asesoría
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="font-heading font-semibold text-[var(--text-primary)] capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-[var(--text-muted)] py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month start */}
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Month days */}
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
                  disabled={!isAvailable || isPast || !isCurrentMonth}
                  onClick={() => dayData && onSelect(dayData)}
                  className={cn(
                    "relative h-10 rounded-lg text-sm font-medium transition-all",
                    !isCurrentMonth && "text-[var(--text-muted)]/30",
                    isCurrentMonth && !isAvailable && !isPast && "text-[var(--text-muted)] cursor-not-allowed",
                    isCurrentMonth && isAvailable && !isSelected && "text-[var(--text-primary)] hover:bg-[var(--primary-light)]",
                    isSelected && "bg-[var(--primary)] text-white",
                    isPast && "text-[var(--text-muted)]/50 cursor-not-allowed"
                  )}
                >
                  {format(day, "d")}
                  {isAvailable && !isPast && isCurrentMonth && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              Disponible
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
              Seleccionado
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
