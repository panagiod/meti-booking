"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useTranslations } from "@/components/providers/locale-provider";
import { formatCurrency } from "@/lib/utils";

interface ManagedAppointment {
  id: string;
  scheduledAt: string;
  durationMin: number;
  status: string;
  totalCents: number;
  serviceName: string;
  instructorName: string;
  cancellable: boolean;
  cancelReason: string | null;
}

function ManageBookingContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const token = searchParams.get("t") ?? "";
  const [appointment, setAppointment] = useState<ManagedAppointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setError(t.bookingManage.invalid);
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/appointments/manage?t=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.bookingManage.invalid);
        return;
      }
      setAppointment(data.appointment);
    } catch {
      setError(t.bookingManage.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [token, t.bookingManage.invalid, t.bookingManage.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCancel = async () => {
    if (!appointment?.cancellable) return;
    const confirmed = window.confirm(t.bookingManage.confirmBody);
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      const res = await fetch("/api/appointments/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.bookingManage.cannotCancel);
        return;
      }
      setCancelled(true);
      setAppointment({ ...appointment, status: "CANCELLED", cancellable: false });
    } catch {
      setError(t.bookingManage.loadError);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="container-meti py-12 max-w-xl">
      <Card>
        <CardContent className="p-8 space-y-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
              {t.bookingManage.title}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {t.bookingManage.subtitle}
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-[var(--text-muted)]">{t.bookingManage.loading}</p>
          ) : error && !appointment ? (
            <p className="text-sm text-[var(--error)]">{error}</p>
          ) : appointment ? (
            <>
              {cancelled && (
                <p className="text-sm text-[var(--primary)]">{t.bookingManage.cancelled}</p>
              )}
              {error && <p className="text-sm text-[var(--error)]">{error}</p>}
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-muted)]">{t.bookingManage.session}</dt>
                  <dd className="font-medium text-[var(--text-primary)]">{appointment.serviceName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-muted)]">{t.bookingManage.instructor}</dt>
                  <dd className="font-medium text-[var(--text-primary)]">{appointment.instructorName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-muted)]">{t.bookingManage.when}</dt>
                  <dd className="font-medium text-[var(--text-primary)] text-right">
                    {format(new Date(appointment.scheduledAt), "EEEE d MMM yyyy 'at' HH:mm", {
                      locale: enUS,
                    })}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-muted)]">{t.bookingManage.price}</dt>
                  <dd className="font-medium text-[var(--text-primary)]">
                    {formatCurrency(appointment.totalCents)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--text-muted)]">{t.bookingManage.status}</dt>
                  <dd className="font-medium text-[var(--text-primary)]">{appointment.status}</dd>
                </div>
              </dl>

              {appointment.cancellable && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? t.bookingManage.cancelling : t.bookingManage.cancel}
                </Button>
              )}
              {!appointment.cancellable && appointment.status !== "CANCELLED" && (
                <p className="text-sm text-[var(--text-muted)]">
                  {appointment.cancelReason || t.bookingManage.cannotCancel}
                </p>
              )}
            </>
          ) : null}

          <Link href="/" className="text-sm text-[var(--primary)] hover:underline inline-block">
            {t.bookingManage.backHome}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManageBookingPage() {
  return (
    <Suspense>
      <ManageBookingContent />
    </Suspense>
  );
}
