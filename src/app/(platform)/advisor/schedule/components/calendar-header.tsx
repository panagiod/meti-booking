"use client";

import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { ViewMode } from "../utils/schedule-utils";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  viewMode: ViewMode;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onBlockClick: () => void;
}

export function CalendarHeader({
  viewMode,
  currentDate,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
  onBlockClick,
}: CalendarHeaderProps) {
  const getTitle = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy", { locale: es });
    }
    if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, "d 'de' MMM")} - ${format(weekEnd, "d 'de' MMM, yyyy", { locale: es })}`;
    }
    if (viewMode === "day") {
      return format(currentDate, "d 'de' MMMM, yyyy", { locale: es });
    }
    const agendaStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const agendaEnd = addWeeks(agendaStart, 2);
    return `${format(agendaStart, "d MMM")} - ${format(agendaEnd, "d MMM, yyyy", { locale: es })}`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onPrev}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="sm" onClick={onToday}>
          Hoy
        </Button>
        <Button variant="ghost" size="icon" onClick={onNext}>
          <ChevronRight className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-heading font-semibold ml-2">{getTitle()}</h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-[var(--border)]">
          {(["month", "week", "day", "agenda"] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange(mode)}
              className={cn(
                "rounded-none",
                mode === "month" && "rounded-l-lg",
                mode === "agenda" && "rounded-r-lg",
                viewMode === mode && "bg-[var(--secondary)] text-white"
              )}
            >
              {mode === "month" ? "Mes" : mode === "week" ? "Semana" : mode === "day" ? "Día" : "Agenda"}
            </Button>
          ))}
        </div>
        <Button onClick={onBlockClick} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]">
          <Plus className="w-4 h-4 mr-1" />
          Bloquear
        </Button>
      </div>
    </div>
  );
}
