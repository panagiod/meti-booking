"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { Calendar, Clock, Star, MessageSquare, CreditCard, XCircle } from "lucide-react";
import { format } from "date-fns";
import { sileo } from "sileo";
import { cn, formatCurrency } from "@/lib/utils";
import { canClientCancelAppointment } from "@/lib/appointment-cancel";
import type { AppointmentStatus } from "@/generated/prisma/client";
import {
  formatMessage,
  useLocale,
  useTranslations,
} from "@/components/providers/locale-provider";
import { getDateFnsLocale } from "@/lib/date-locale";
import { formatDateTime } from "@/lib/format";

interface Appointment {
  id: string;
  scheduledAt: string;
  durationMin: number;
  status: string;
  totalCents: number;
  service: { name: string; rescheduleHoursMin: number };
  instructor: { user: { name: string; image: string | null } };
  review?: { id: string; rating: number; comment: string | null } | null;
}

function clientCanCancel(appointment: Appointment): boolean {
  return canClientCancelAppointment({
    status: appointment.status as AppointmentStatus,
    scheduledAt: new Date(appointment.scheduledAt),
    rescheduleHoursMin: appointment.service.rescheduleHoursMin ?? 24,
  }).allowed;
}

export default function AppointmentsPage() {
  const t = useTranslations();
  const { locale } = useLocale();
  const dateLocale = getDateFnsLocale(locale);
  const dialog = useDialog();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [reviewAppointment, setReviewAppointment] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetch("/api/studio")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.paymentsEnabled === "boolean") {
          setPaymentsEnabled(data.paymentsEnabled);
        }
      })
      .catch(() => {});
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/client/appointments", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.scheduledAt);
    const now = new Date();
    if (filter === "upcoming") return aptDate >= now;
    if (filter === "past") return aptDate < now;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success">{t.dashboard.statusConfirmed}</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="default">{t.dashboard.statusInProgress}</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">{t.dashboard.statusCompleted}</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">{t.dashboard.statusCancelled}</Badge>;
      case "PENDING":
        return <Badge variant="warning">{t.dashboard.statusPending}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openReview = (apt: Appointment) => {
    setReviewAppointment(apt);
    setRating(apt.review?.rating || 0);
    setComment(apt.review?.comment || "");
  };

  const submitReview = async () => {
    if (!reviewAppointment || rating === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${reviewAppointment.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.dashboard.reviewError);
      }
      sileo.success({
        title: t.dashboard.reviewThanks,
        description: t.dashboard.reviewThanksSub,
      });
      setReviewAppointment(null);
      await fetchAppointments();
    } catch (err: any) {
      sileo.error({
        title: t.common.error,
        description: err.message || t.dashboard.reviewError,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    const when = formatDateTime(appointment.scheduledAt, locale);
    const confirmed = await dialog.showConfirm(
      t.dashboard.cancelBookingTitle,
      appointment.status === "CONFIRMED"
        ? formatMessage(t.dashboard.cancelConfirmedBody, {
            service: appointment.service.name,
            when,
          })
        : formatMessage(t.dashboard.cancelUnpaidBody, {
            service: appointment.service.name,
          }),
      "warning"
    );
    if (!confirmed) return;

    setCancellingId(appointment.id);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: t.dashboard.cancelReasonClient }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.dashboard.cancelError);
      }
      sileo.success({
        title: t.dashboard.bookingCancelled,
        description: t.dashboard.bookingCancelledSub,
      });
      await fetchAppointments();
    } catch (err: any) {
      sileo.error({
        title: t.common.error,
        description: err.message || t.dashboard.cancelError,
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleRetryPayment = async (appointmentId: string) => {
    setRetryingId(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/pay`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate payment link");
      }
      const { initPoint } = await res.json();
      window.location.href = initPoint;
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.message || "Could not generate payment link." });
      setRetryingId(null);
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          {t.dashboard.bookingsPageTitle}
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          {t.dashboard.bookingsPageSub}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          {t.dashboard.filterAll}
        </Button>
        <Button
          variant={filter === "upcoming" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("upcoming")}
        >
          {t.dashboard.filterUpcoming}
        </Button>
        <Button
          variant={filter === "past" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("past")}
        >
          {t.dashboard.filterPast}
        </Button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Calendar}
              title={t.dashboard.noBookings}
              description={t.dashboard.noBookingsSub}
              action={{
                label: t.dashboard.bookSessionTitle,
                onClick: () => (window.location.href = "/book"),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <Card key={apt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                      {apt.instructor.user.image ? (
                        <img
                          src={apt.instructor.user.image}
                          alt={apt.instructor.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <span className="font-medium text-[var(--primary)]">
                          {apt.instructor.user.name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {apt.service.name}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {formatMessage(t.dashboard.withInstructor, {
                          name: apt.instructor.user.name,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(apt.scheduledAt), "d MMM yyyy", { locale: dateLocale })}
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <Clock className="w-4 h-4" />
                      {format(new Date(apt.scheduledAt), "HH:mm")} •{" "}
                      {formatMessage(t.dashboard.minutes, { count: apt.durationMin })}
                    </div>
                    <div className="font-medium text-[var(--text-primary)]">
                      {formatCurrency(apt.totalCents)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(apt.status)}
                    {apt.status === "PENDING" && paymentsEnabled && (
                      <Button
                        size="sm"
                        onClick={() => handleRetryPayment(apt.id)}
                        disabled={retryingId === apt.id}
                      >
                        {retryingId === apt.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-1" />
                            {t.dashboard.pay}
                          </>
                        )}
                      </Button>
                    )}
                    {(apt.status === "PENDING" || apt.status === "CONFIRMED") && clientCanCancel(apt) && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancelAppointment(apt)}
                        disabled={cancellingId === apt.id}
                      >
                        {cancellingId === apt.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            {t.dashboard.cancel}
                          </>
                        )}
                      </Button>
                    )}
                    {apt.status === "CONFIRMED" && !clientCanCancel(apt) && new Date(apt.scheduledAt) > new Date() && (
                      <span className="text-xs text-[var(--text-muted)] max-w-[10rem] text-right">
                        {t.dashboard.tooLateToCancel}
                      </span>
                    )}
                    {apt.status === "COMPLETED" && (
                      <Button size="sm" variant={apt.review ? "secondary" : "default"} onClick={() => openReview(apt)}>
                        {apt.review ? (
                          <>
                            <Star className="w-4 h-4 mr-1 text-[var(--star)]" />
                            {apt.review.rating}★
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {t.dashboard.review}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">
                {reviewAppointment.review
                  ? t.dashboard.yourReview
                  : t.dashboard.rateSession}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--text-muted)]">
                {formatMessage(t.dashboard.sessionWith, {
                  service: reviewAppointment.service.name,
                  name: reviewAppointment.instructor.user.name,
                })}
              </p>

              {/* Stars */}
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={cn(
                      "transition-transform hover:scale-110",
                      star <= rating ? "text-[var(--star)]" : "text-[var(--star-empty)]"
                    )}
                    aria-label={`${star} stars`}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.dashboard.reviewPlaceholder}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
              />

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="secondary" onClick={() => setReviewAppointment(null)}>
                  {t.dashboard.close}
                </Button>
                <Button onClick={submitReview} disabled={isSubmitting || rating === 0}>
                  {isSubmitting
                    ? t.dashboard.saving
                    : reviewAppointment.review
                      ? t.dashboard.updateReview
                      : t.dashboard.submitReview}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog state={dialog} />
    </div>
  );
}
