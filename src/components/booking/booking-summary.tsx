"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Tag } from "lucide-react";
import { formatDuration, type Service, type DaySlots } from "@/lib/slots";
import {
  formatMessage,
  useLocale,
  useTranslations,
} from "@/components/providers/locale-provider";
import { getDateFnsLocale } from "@/lib/date-locale";
import { formatMoney } from "@/lib/format";

interface Quote {
  servicePriceCents: number;
  discountCents: number;
  platformFeeCents: number;
  totalCents: number;
  feePercentage: number;
  promotion?: { id: string; name: string } | null;
}

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
  const serviceName = t.booking.serviceNames[service.name] ?? service.name;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadQuote = async () => {
      setQuoteLoading(true);
      try {
        let promotionId: string | undefined;
        const promoRes = await fetch(`/api/promotions?serviceId=${service.id}`);
        if (promoRes.ok) {
          const promoData = await promoRes.json();
          promotionId = promoData.promotion?.id;
        }

        const params = new URLSearchParams({ serviceId: service.id });
        if (promotionId) params.set("promotionId", promotionId);

        const res = await fetch(`/api/checkout/quote?${params.toString()}`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          setQuote(data.quote);
          if (typeof data.paymentsEnabled === "boolean") {
            setPaymentsEnabled(data.paymentsEnabled);
          }
        }
      } catch {
        if (!cancelled) setQuote(null);
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    };

    loadQuote();
    return () => {
      cancelled = true;
    };
  }, [service.id]);

  const totalCents = quote?.totalCents;
  const listPriceCents =
    quote != null
      ? quote.servicePriceCents + quote.platformFeeCents
      : null;

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

          {quote && quote.discountCents > 0 && listPriceCents != null && (
            <>
              <div className="flex justify-between gap-4 text-sm">
                <dt className="text-[var(--studio-muted)]">{serviceName}</dt>
                <dd className="text-[var(--studio-muted)] line-through">
                  {formatMoney(listPriceCents, locale)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <dt className="flex items-center gap-1 text-[var(--studio-accent,var(--studio-ink))]">
                  <Tag className="h-3.5 w-3.5" />
                  {quote.promotion?.name}
                </dt>
                <dd className="font-medium text-[var(--studio-accent,var(--studio-ink))]">
                  -{formatMoney(quote.discountCents, locale)}
                </dd>
              </div>
            </>
          )}

          <div className="flex justify-between gap-4 pt-1">
            <dt className="font-display text-xl text-[var(--studio-ink)]">
              {paymentsEnabled ? t.booking.total : t.booking.sessionPrice}
            </dt>
            <dd className="font-display text-xl text-[var(--studio-ink)]">
              {quoteLoading ? (
                <span className="inline-block h-6 w-20 animate-pulse rounded bg-[var(--studio-line)]" />
              ) : totalCents != null ? (
                formatMoney(totalCents, locale)
              ) : (
                formatMoney(service.priceCents, locale)
              )}
            </dd>
          </div>
        </dl>

        {!quoteLoading && quote && paymentsEnabled && (
          <p className="mt-2 text-xs text-[var(--studio-muted)]">{t.checkout.includesCosts}</p>
        )}

        <p className="mt-6 text-xs leading-relaxed text-[var(--studio-muted)]">
          {formatMessage(t.booking.reschedulePolicy, {
            hours: service.rescheduleHoursMin || 24,
          })}
        </p>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing || quoteLoading}
          className="studio-btn studio-btn-primary mt-8 w-full disabled:opacity-60"
        >
          {isProcessing
            ? t.booking.processing
            : paymentsEnabled
              ? t.booking.continuePayment
              : t.booking.confirmBooking}
        </button>
      </div>
    </div>
  );
}
