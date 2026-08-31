"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
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
        <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">
          Selecciona la hora
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {format(daySlots.date, "EEEE d 'de' MMMM", { locale: es })}
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
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
                No hay horarios disponibles para esta fecha
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
