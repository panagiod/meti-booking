"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { Calendar, Clock, Video, Star, MessageSquare, CreditCard, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { sileo } from "sileo";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  scheduledAt: string;
  durationMin: number;
  status: string;
  totalCents: number;
  service: { name: string };
  advisor: { user: { name: string; image: string | null } };
  review?: { id: string; rating: number; comment: string | null } | null;
}

export default function AppointmentsPage() {
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

  useEffect(() => {
    fetchAppointments();
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
        return <Badge variant="success">Confirmada</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="default">En progreso</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">Completada</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelada</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pago pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(cents);
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
        throw new Error(data.error || "Error al guardar la reseña");
      }
      sileo.success({ title: "¡Gracias por tu reseña!", description: "Tu calificación ayuda a otros clientes." });
      setReviewAppointment(null);
      await fetchAppointments();
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.message || "No se pudo guardar la reseña." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    const confirmed = await dialog.showConfirm(
      "Cancelar cita",
      `¿Estás seguro de cancelar la cita de ${appointment.service.name} con ${appointment.advisor.user.name}? Esta acción no se puede deshacer.`,
      "warning"
    );
    if (!confirmed) return;

    setCancellingId(appointment.id);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: "Cancelado por el cliente" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al cancelar la cita");
      }
      sileo.success({ title: "Cita cancelada", description: "El horario ha sido liberado." });
      await fetchAppointments();
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.message || "No se pudo cancelar la cita." });
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
        throw new Error(data.error || "Error al generar link de pago");
      }
      const { initPoint } = await res.json();
      window.location.href = initPoint;
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.message || "No se pudo generar el link de pago." });
      setRetryingId(null);
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Mis Citas
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Administra tus asesorías programadas
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todas
        </Button>
        <Button
          variant={filter === "upcoming" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("upcoming")}
        >
          Próximas
        </Button>
        <Button
          variant={filter === "past" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("past")}
        >
          Pasadas
        </Button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Calendar}
              title="No tienes citas"
              description="Explora nuestros asesores y agenda tu primera asesoría."
              action={{
                label: "Explorar asesores",
                onClick: () => (window.location.href = "/services"),
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
                      {apt.advisor.user.image ? (
                        <img
                          src={apt.advisor.user.image}
                          alt={apt.advisor.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <span className="font-medium text-[var(--primary)]">
                          {apt.advisor.user.name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {apt.service.name}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        con {apt.advisor.user.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(apt.scheduledAt), "d MMM yyyy", { locale: es })}
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <Clock className="w-4 h-4" />
                      {format(new Date(apt.scheduledAt), "HH:mm")} • {apt.durationMin} min
                    </div>
                    <div className="font-medium text-[var(--text-primary)]">
                      {formatCurrency(apt.totalCents)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(apt.status)}
                    {apt.status === "PENDING" && (
                      <>
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
                              Pagar
                            </>
                          )}
                        </Button>
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
                              Cancelar
                            </>
                          )}
                        </Button>
                      </>
                    )}
                    {(apt.status === "CONFIRMED" || apt.status === "IN_PROGRESS") && (
                      <Button size="sm" asChild>
                        <Link href={`/call/${apt.id}`}>
                          <Video className="w-4 h-4 mr-1" />
                          Unirse
                        </Link>
                      </Button>
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
                            Reseña
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
                {reviewAppointment.review ? "Tu reseña" : "Califica tu asesoría"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--text-muted)]">
                {reviewAppointment.service.name} con {reviewAppointment.advisor.user.name}
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
                    aria-label={`${star} estrellas`}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cuéntanos sobre tu experiencia (opcional)..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] resize-none"
              />

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="secondary" onClick={() => setReviewAppointment(null)}>
                  Cerrar
                </Button>
                <Button onClick={submitReview} disabled={isSubmitting || rating === 0}>
                  {isSubmitting
                    ? "Guardando..."
                    : reviewAppointment.review
                      ? "Actualizar reseña"
                      : "Enviar reseña"}
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
