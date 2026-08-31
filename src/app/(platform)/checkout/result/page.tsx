"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sileo } from "sileo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/loading";
import { CheckCircle, XCircle, Clock, Calendar, ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { formatDateTime } from "@/lib/format";

type ResultStatus = "approved" | "pending" | "failure" | "unknown";

interface ResultAppointment {
  id: string;
  status: string;
  scheduledAt: string;
  durationMin: number;
  service?: { name: string } | null;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const t = useTranslations();
  const { locale } = useLocale();
  const appointmentId = searchParams.get("appointmentId");
  const statusParam = (searchParams.get("status") || "unknown") as ResultStatus;
  const paymentId = searchParams.get("payment_id");

  const [appointment, setAppointment] = useState<ResultAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(!!appointmentId);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);

  const fetchAppointment = useCallback(async () => {
    if (!appointmentId) return;
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        setIsUnauthorized(true);
        setIsLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAppointment(data.appointment);
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (!appointmentId || !paymentId) return;
    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ paymentId }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.confirmed) {
            await fetchAppointment();
          }
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
      }
    };
    verifyPayment();
  }, [appointmentId, paymentId, fetchAppointment]);

  useEffect(() => {
    const load = async () => {
      await fetchAppointment();
    };
    void load();
  }, [fetchAppointment]);

  useEffect(() => {
    if (!appointment || appointment.status === "CONFIRMED" || pollAttempts >= 6) {
      return;
    }
    if (appointment.status === "PENDING") {
      const timer = setTimeout(async () => {
        await fetchAppointment();
        setPollAttempts((n) => n + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appointment, pollAttempts, fetchAppointment]);

  useEffect(() => {
    if (appointment?.status === "CONFIRMED") {
      sileo.success({
        title: t.checkoutResult.toastConfirmedTitle,
        description: t.checkoutResult.toastConfirmedSub,
        duration: 6000,
      });
    }
  }, [appointment?.status, t.checkoutResult.toastConfirmedTitle, t.checkoutResult.toastConfirmedSub]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (isUnauthorized || !appointmentId) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <LanguageSwitcher className="border-[var(--border)]" />
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-[var(--text-muted)] mb-4">
              {isUnauthorized ? t.checkoutResult.signInToView : t.checkoutResult.noBookingInfo}
            </p>
            <Button asChild className="w-full">
              <Link href={isUnauthorized ? "/login" : "/book"}>
                {isUnauthorized ? t.auth.signIn : t.checkoutResult.bookAgain}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isConfirmed = appointment?.status === "CONFIRMED";
  const failed =
    !isConfirmed && (statusParam === "failure" || appointment?.status === "CANCELLED");
  const serviceLabel =
    appointment?.service?.name &&
    (t.booking.serviceNames[appointment.service.name] ?? appointment.service.name);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <LanguageSwitcher className="border-[var(--border)]" />
      </div>
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {isConfirmed ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[var(--success)]" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                {t.checkoutResult.paymentConfirmed}
              </h1>
              <p className="text-[var(--text-muted)] mb-4">
                {t.checkoutResult.paymentConfirmedSub}
              </p>
              <div className="bg-[var(--background)] rounded-lg p-4 mb-6 space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                  <span className="text-[var(--text-primary)] capitalize">
                    {appointment && formatDateTime(appointment.scheduledAt, locale)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 flex-shrink-0" />
                  <span className="text-[var(--text-muted)]">
                    {serviceLabel} · {appointment?.durationMin} {t.checkout.min}
                  </span>
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link href="/dashboard">{t.checkoutResult.goToDashboard}</Link>
              </Button>
            </>
          ) : failed ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[var(--error-light)] flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-[var(--error)]" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                {t.checkoutResult.paymentFailed}
              </h1>
              <p className="text-[var(--text-muted)] mb-6">{t.checkoutResult.paymentFailedSub}</p>
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href="/book">{t.checkoutResult.bookAgain}</Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t.checkoutResult.goToDashboard}
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[var(--warning-light)] flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[var(--warning)] animate-pulse" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                {t.checkoutResult.confirmingPayment}
              </h1>
              <p className="text-[var(--text-muted)] mb-2">
                {t.checkoutResult.confirmingPaymentSub}
              </p>
              {pollAttempts >= 6 && (
                <p className="text-sm text-[var(--warning)] mb-4">
                  {t.checkoutResult.stillPending}
                </p>
              )}
              <div className="flex justify-center py-2">
                <div className="loading-spinner loading-spinner-sm" />
              </div>
              <Button variant="ghost" className="w-full mt-4" onClick={fetchAppointment}>
                {t.checkoutResult.refreshStatus}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ResultContent />
    </Suspense>
  );
}
