"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import Link from "next/link";
import { sileo } from "sileo";
import { useAdvisorDashboard } from "@/lib/hooks";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Briefcase,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(cents);
}

export default function AdvisorDashboard() {
  const { data, isLoading, error } = useAdvisorDashboard();

  // Alerta de nuevas reservas: muestra un toast por cada cita nueva
  // desde la última vez que el asesor visitó su panel.
  useEffect(() => {
    if (!data?.recentAppointments?.length) return;
    const lastSeenId = localStorage.getItem("meti-last-seen-appointment");
    for (const apt of data.recentAppointments) {
      if (apt.id !== lastSeenId) {
        sileo.action({
          title: "🔔 Nueva reserva",
          description: `${apt.clientName} reservó ${apt.serviceName} para ${format(new Date(apt.scheduledAt), "EEE d 'de' MMM 'a las' HH:mm", { locale: es })}`,
          duration: 8000,
        });
      }
    }
    if (data.recentAppointments.length > 0) {
      localStorage.setItem(
        "meti-last-seen-appointment",
        data.recentAppointments[0].id
      );
    }
  }, [data?.recentAppointments]);

  if (isLoading) return <LoadingPage />;

  const stats = data?.stats || {
    weekAppointments: 0,
    servicesCount: 0,
    monthEarnings: 0,
    rating: 0,
  };

  const upcomingAppointments = data?.upcomingAppointments || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Dashboard
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Resumen de tu actividad como asesor
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Citas esta semana</p>
                <p className="text-2xl font-heading font-bold text-[var(--text-primary)] mt-1">
                  {stats.weekAppointments}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--primary-light)]">
                <Calendar className="w-5 h-5 text-[var(--primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Servicios activos</p>
                <p className="text-2xl font-heading font-bold text-[var(--text-primary)] mt-1">
                  {stats.servicesCount}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--accent-light)]">
                <Briefcase className="w-5 h-5 text-[var(--accent)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Ingresos del mes</p>
                <p className="text-2xl font-heading font-bold text-[var(--text-primary)] mt-1">
                  {formatCurrency(stats.monthEarnings)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--success-light)]">
                <DollarSign className="w-5 h-5 text-[var(--success)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Calificación</p>
                <p className="text-2xl font-heading font-bold text-[var(--text-primary)] mt-1">
                  {stats.rating > 0 ? stats.rating.toFixed(1) : "-"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--warning-light)]">
                <TrendingUp className="w-5 h-5 text-[var(--warning)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Próximas citas</CardTitle>
              <Link
                href="/advisor/schedule"
                className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="Sin citas programadas"
                  description="Cuando los clientes agenden asesorías, aparecerán aquí."
                />
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt: any) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--background)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                          <span className="font-medium text-[var(--primary)]">
                            {apt.clientName?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {apt.clientName}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {apt.serviceName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[var(--text-primary)]">
                          {format(new Date(apt.scheduledAt), "d MMM, HH:mm", { locale: es })}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {apt.duration} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link href="/advisor/services">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear servicio
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                asChild
              >
                <Link href="/advisor/schedule">
                  <Calendar className="w-4 h-4 mr-2" />
                  Configurar horarios
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                asChild
              >
                <Link href="/advisor/mercadopago">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Configurar pagos
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white">
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold mb-2">
                💡 Consejo del día
              </h3>
              <p className="text-sm text-white/90">
                Completa tu perfil con un video de presentación para atraer más
                clientes. Los asesores con video reciben 3x más reservas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
