"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Clock } from "lucide-react";
import { DaySchedule } from "../utils/schedule-utils";
import { cn } from "@/lib/utils";

interface WeeklyScheduleFormProps {
  schedule: DaySchedule[];
  hasChanges: boolean;
  onToggleDay: (dayOfWeek: number) => void;
  onTimeChange: (dayOfWeek: number, field: keyof DaySchedule, value: string) => void;
  onSave: () => void;
}

export function WeeklyScheduleForm({
  schedule,
  hasChanges,
  onToggleDay,
  onTimeChange,
  onSave,
}: WeeklyScheduleFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={!hasChanges}>
          <Save className="w-4 h-4 mr-2" />
          Save schedule
        </Button>
      </div>

      {schedule.map((day) => (
        <Card key={day.dayOfWeek} className={!day.isActive ? "opacity-60" : ""}>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center justify-between md:w-40">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleDay(day.dayOfWeek)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      day.isActive ? "bg-[var(--success)]" : "bg-[var(--border)]"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                        day.isActive ? "left-7" : "left-1"
                      )}
                    />
                  </button>
                  <span className="font-medium text-[var(--text-primary)]">
                    {day.dayName}
                  </span>
                </div>
              </div>

              {day.isActive ? (
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Start</label>
                    <Input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => onTimeChange(day.dayOfWeek, "startTime", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">End</label>
                    <Input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => onTimeChange(day.dayOfWeek, "endTime", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Lunch start</label>
                    <Input
                      type="time"
                      value={day.lunchStart}
                      onChange={(e) => onTimeChange(day.dayOfWeek, "lunchStart", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Lunch end</label>
                    <Input
                      type="time"
                      value={day.lunchEnd}
                      onChange={(e) => onTimeChange(day.dayOfWeek, "lunchEnd", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-sm text-[var(--text-muted)] italic">
                  Not available
                </div>
              )}
            </div>

            {day.isActive && (
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-muted)]">Gap:</span>
                  <Input
                    type="number"
                    value={day.gapMinutes}
                    onChange={(e) => onTimeChange(day.dayOfWeek, "gapMinutes", e.target.value)}
                    className="w-16 h-8 text-sm text-center"
                    min={0}
                    max={60}
                  />
                  <span className="text-sm text-[var(--text-muted)]">min</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
