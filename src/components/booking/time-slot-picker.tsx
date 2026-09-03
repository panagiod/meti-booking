"use client";

import { format } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DaySlots } from "@/lib/slots";
import {
  formatMessage,
  useLocale,
  useTranslations,
} from "@/components/providers/locale-provider";
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
  const visibleSlots = daySlots.slots.filter((slot) => slot.available || slot.remaining === 0);
  const hasAnySlot = visibleSlots.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="font-display text-2xl text-[var(--studio-ink)] sm:text-3xl">
          {t.booking.pickTime}
        </h2>
        <p className="mt-2 text-sm text-[var(--studio-muted)] sm:text-base">
          {format(daySlots.date, "EEEE, d MMMM", { locale: dateFnsLocale })}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-4 sm:p-6">
        {hasAnySlot ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {visibleSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const isFull = !slot.available;

              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={isFull}
                  onClick={() => onSelect(slot.time)}
                  className={cn(
                    "flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-sm font-medium transition",
                    isFull &&
                      "cursor-not-allowed border-[var(--studio-line)] bg-[var(--studio-warm)]/50 text-[var(--studio-muted)] opacity-60",
                    !isFull &&
                      isSelected &&
                      "border-[var(--studio-ink)] bg-[var(--studio-ink)] text-white",
                    !isFull &&
                      !isSelected &&
                      "border-[var(--studio-line)] text-[var(--studio-ink)] hover:border-[var(--studio-ink)] active:scale-[0.98]"
                  )}
                >
                  <span>{slot.time}</span>
                  <span
                    className={cn(
                      "mt-0.5 text-[0.65rem] font-normal leading-tight",
                      isSelected ? "text-white/80" : "text-[var(--studio-muted)]"
                    )}
                  >
                    {isFull
                      ? t.booking.slotFull
                      : formatMessage(t.booking.spotsLeft, {
                          remaining: slot.remaining,
                        })}
                  </span>
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
