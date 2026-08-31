"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, DollarSign, AlertCircle, Tag } from "lucide-react";
import { formatCurrency, formatDuration, type Service, type DaySlots } from "@/lib/slots";

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
  const promo = service.promotion;
  const discountCents = promo
    ? promo.discountType === "percentage"
      ? Math.round(service.priceCents * promo.discountValue / 100)
      : Math.round(promo.discountValue * 100)
    : 0;
  const priceAfterDiscount = Math.max(service.priceCents - discountCents, 0);
  const fee = Math.round(service.priceCents * 0.15);
  const totalOriginal = service.priceCents + fee;
  const totalWithDiscount = priceAfterDiscount + fee;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">
          Resumen de tu reserva
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Revisa los detalles antes de confirmar
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Service */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                {service.name}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {formatDuration(service.durationMin)}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                {format(daySlots.date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--warning-light)] flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">{time}</p>
              <p className="text-sm text-[var(--text-muted)]">
                Duración: {formatDuration(service.durationMin)}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="border-t border-[var(--border)] pt-4 space-y-2">
            {discountCents > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Valor original</span>
                  <span className="text-[var(--text-muted)] line-through">{formatCurrency(totalOriginal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-[var(--accent)]">
                    <Tag className="w-4 h-4" />
                    {promo!.name}
                  </span>
                  <span className="text-[var(--accent)] font-medium">
                    -{formatCurrency(discountCents)}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between font-heading font-bold text-lg">
              <span className="text-[var(--text-primary)]">Total</span>
              <span className="text-[var(--primary)]">
                {discountCents > 0 ? formatCurrency(totalWithDiscount) : formatCurrency(totalOriginal)}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Incluye todos los costos
            </p>
          </div>

          {/* Policy */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--background)]">
            <AlertCircle className="w-4 h-4 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[var(--text-muted)]">
              <p className="font-medium text-[var(--text-secondary)] mb-1">
                Política de cambios
              </p>
              <p>
                Reagendar gratis con {service.rescheduleHoursMin || 24}h de
                anticipación. Cancelar sin reagendar = sin devolución.
              </p>
            </div>
          </div>

          {/* CTA */}
          <Button
            className="w-full h-12 text-base"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </div>
            ) : (
              "Continuar al pago"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
