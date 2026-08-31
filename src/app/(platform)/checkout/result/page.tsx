"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sileo } from "sileo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/loading";
import { CheckCircle, XCircle, Clock, Calendar, ArrowLeft } from "lucide-react";

type ResultStatus = "approved" | "pending" | "failure" | "unknown";

interface ResultAppointment {
  id: string;
  status: string;
  scheduledAt: string;
  durationMin: number;
  service?: { name: string } | null;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ResultContent() {
  const searchParams = useSearchParams();
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

  // If payment_id comes from MP, verify payment directly via the API
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

  // Poll: MP webhook may take a few seconds to confirm
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

  // Toast when payment is confirmed
  useEffect(() => {
    if (appointment?.status === "CONFIRMED") {
      sileo.success({
        title: "Payment confirmed!",
        description: "Your consultation has been booked. Review the details below.",
        duration: 6000,
      });
    }
  }, [appointment?.status]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <LoadingPage />
      </div>
    );
  }

  if (isUnauthorized || !appointmentId) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-[var(--text-muted)] mb-4">
              {isUnauthorized
                ? "Sign in to view your booking status."
                : "No booking information available."}
            </p>
            <Button asChild className="w-full">
              <Link href={isUnauthorized ? "/login" : "/services"}>
                {isUnauthorized ? "Sign in" : "Browse services"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isConfirmed = appointment?.status === "CONFIRMED";

  // Visual state based on actual payment
  const failed = !isConfirmed && (statusParam === "failure" || appointment?.status === "CANCELLED");

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {isConfirmed ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[var(--success)]" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                Payment confirmed!
              </h1>
              <p className="text-[var(--text-muted)] mb-4">
                Your consultation has been booked. You will receive the video call link before the appointment.
              </p>
              <div className="bg-[var(--background)] rounded-lg p-4 mb-6 space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                  <span className="text-[var(--text-primary)] capitalize">
                    {formatDateTime(appointment.scheduledAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 flex-shrink-0" />
                  <span className="text-[var(--text-muted)]">
                    {appointment.service?.name} • {appointment.durationMin} min
                  </span>
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link href="/dashboard">Go to my dashboard</Link>
              </Button>
            </>
          ) : failed ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[var(--error-light)] flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-[var(--error)]" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                Payment was not completed
              </h1>
              <p className="text-[var(--text-muted)] mb-6">
                No charge was made. You can try again whenever you like.
              </p>
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href="/services">Browse advisors</Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go to my dashboard
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
                Confirming your payment…
              </h1>
              <p className="text-[var(--text-muted)] mb-2">
                Mercado Pago is processing your payment. This takes a few seconds.
              </p>
              {pollAttempts >= 6 && (
                <p className="text-sm text-[var(--warning)] mb-4">
                  Still pending. Check your booking in a few minutes.
                </p>
              )}
              <div className="flex justify-center py-2">
                <div className="loading-spinner loading-spinner-sm" />
              </div>
              <Button variant="ghost" className="w-full mt-4" onClick={fetchAppointment}>
                Refresh status
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
