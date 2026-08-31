"use client";

import { format } from "date-fns";
import { formatCurrency, formatDuration, type Service, type DaySlots } from "@/lib/slots";
import {
  formatMessage,
  useLocale,
  useTranslations,
} from "@/components/providers/locale-provider";
import { getDateFnsLocale } from "@/lib/date-locale";

interface BookingSummaryProps {
  service: Service & { rescheduleHoursMin?: number };
  daySlots: DaySlots;
  time: string;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export function BookingSummary({
  service,
  daySlots,
  time,
  onConfirm,
  isProcessing = false,
}: BookingSummaryProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const dateFnsLocale = getDateFnsLocale(locale);
  const fee = Math.round(service.priceCents * 0.15);
  const total = service.priceCents + fee;
  const serviceName = t.booking.serviceNames[service.name] ?? service.name;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl text-[var(--studio-ink)]">{t.booking.confirm}</h2>
        <p className="mt-2 text-[var(--studio-muted)]">{t.booking.confirmSub}</p>
      </div>

      <div className="rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-6 sm:p-8">
        <dl className="space-y-5 text-sm">
          <div className="flex justify-between gap-4 border-b border-[var(--studio-line)] pb-5">
            <dt className="text-[var(--studio-muted)]">{t.booking.session}</dt>
            <dd className="text-right font-medium text-[var(--studio-ink)]">
              {serviceName}
              <span className="mt-0.5 block text-[var(--studio-muted)] font-normal">
                {formatDuration(service.durationMin)}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--studio-line)] pb-5">
            <dt className="text-[var(--studio-muted)]">{t.booking.date}</dt>
            <dd className="text-right font-medium text-[var(--studio-ink)]">
              {format(daySlots.date, "EEEE, d MMM", { locale: dateFnsLocale })}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--studio-line)] pb-5">
            <dt className="text-[var(--studio-muted)]">{t.booking.time}</dt>
            <dd className="font-medium text-[var(--studio-ink)]">{time}</dd>
          </div>
          <div className="flex justify-between gap-4 pt-1">
            <dt className="font-display text-xl text-[var(--studio-ink)]">{t.booking.total}</dt>
            <dd className="font-display text-xl text-[var(--studio-ink)]">{formatCurrency(total)}</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs leading-relaxed text-[var(--studio-muted)]">
          {formatMessage(t.booking.reschedulePolicy, {
            hours: service.rescheduleHoursMin || 24,
          })}
        </p>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing}
          className="studio-btn studio-btn-primary mt-8 w-full disabled:opacity-60"
        >
          {isProcessing ? t.booking.processing : t.booking.continuePayment}
        </button>
      </div>
    </div>
  );
}
