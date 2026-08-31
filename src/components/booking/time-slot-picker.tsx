"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DaySlots, TimeSlot } from "@/lib/slots";

interface TimeSlotPickerProps {
  daySlots: DaySlots;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export function TimeSlotPicker({
  daySlots,
  selectedTime,
  onSelect,
}: TimeSlotPickerProps) {
  const availableSlots = daySlots.slots.filter((s) => s.available);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Pick a time
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {format(daySlots.date, "EEEE, MMMM d", { locale: enUS })}
        </p>
      </div>

      <Card className="border-[var(--border)] shadow-none">
        <CardContent className="p-4 sm:p-5">
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const [hours, minutes] = slot.time.split(":").map(Number);
                const period = hours >= 12 ? "PM" : "AM";
                const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

                return (
                  <Button
                    key={slot.time}
                    variant={isSelected ? "default" : "secondary"}
                    className={cn(
                      "h-12 text-base font-medium",
                      isSelected && "bg-[var(--primary)] text-white"
                    )}
                    onClick={() => onSelect(slot.time)}
                  >
                    {slot.time}
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-[var(--text-muted)]">
                No time slots available for this date
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
