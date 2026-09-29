"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AdminStudioBooking } from "@/components/admin/admin-upcoming-bookings";
import {
  formatStudioDateTime,
  formatStudioTime,
} from "@/lib/timezone";
import {
  formatMessage,
  useLocale,
  useTranslations,
} from "@/components/providers/locale-provider";

type CancelledBooking = AdminStudioBooking & {
  cancelReason: string | null;
  cancelledAt: string | null;
};

export function AdminCancelledBookings() {
  const t = useTranslations();
  const { locale } = useLocale();
  const [bookings, setBookings] = useState<CancelledBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/studio/appointments?view=cancelled", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setBookings(data.appointments || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t.admin.cancelledBookings}</CardTitle>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {isLoading
            ? t.admin.loading
            : bookings.length === 1
              ? t.admin.cancelledBookingsCountOne
              : formatMessage(t.admin.cancelledBookingsCount, { count: bookings.length })}
        </p>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-[var(--text-muted)]">{t.admin.cancelledBookingsHint}</p>
        {bookings.length === 0 && !isLoading ? (
          <p className="text-sm italic text-[var(--text-muted)]">{t.admin.noCancelled}</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {bookings.map((booking) => (
              <li key={booking.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--text-primary)]">
                    {formatStudioDateTime(new Date(booking.scheduledAt), locale)}
                  </p>
                  <Badge variant="destructive">{t.admin.statusCancelled}</Badge>
                  {booking.isTestBooking ? (
                    <Badge variant="outline">{t.admin.testBooking}</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  {booking.serviceName} · {formatStudioTime(new Date(booking.scheduledAt))} ·{" "}
                  {booking.clientName} · {booking.clientEmail}
                </p>
                {booking.cancelledAt ? (
                  <p className="text-sm text-[var(--text-muted)]">
                    {t.admin.cancelledAtLabel}:{" "}
                    {formatStudioDateTime(new Date(booking.cancelledAt), locale)}
                  </p>
                ) : null}
                {booking.cancelReason ? (
                  <p className="text-sm text-[var(--text-primary)]">
                    {t.admin.cancelReasonLabel}: {booking.cancelReason}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
