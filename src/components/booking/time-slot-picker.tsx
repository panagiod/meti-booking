"use client";

import { format } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DaySlots } from "@/lib/slots";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { getDateFnsLocale } from "@/lib/date-locale";

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
  const t = useTranslations();
  const { locale } = useLocale();
  const dateFnsLocale = getDateFnsLocale(locale);
  const availableSlots = daySlots.slots.filter((s) => s.available);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl text-[var(--studio-ink)]">{t.booking.pickTime}</h2>
        <p className="mt-2 text-[var(--studio-muted)]">
          {format(daySlots.date, "EEEE, d MMMM", { locale: dateFnsLocale })}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-5 sm:p-6">
        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {availableSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => onSelect(slot.time)}
                  className={cn(
                    "h-11 rounded-lg border text-sm font-medium transition",
                    isSelected
                      ? "border-[var(--studio-ink)] bg-[var(--studio-ink)] text-white"
                      : "border-[var(--studio-line)] text-[var(--studio-ink)] hover:border-[var(--studio-ink)]"
                  )}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center">
            <Clock className="mx-auto mb-3 h-8 w-8 text-[var(--studio-muted)]" />
            <p className="text-[var(--studio-muted)]">{t.booking.noSlots}</p>
          </div>
        )}
      </div>
    </div>
  );
}
