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
import { enUS } from "date-fns/locale";
import {
  Calendar,
  Briefcase,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(cents);
}

export default function AdvisorDashboard() {
  const { data, isLoading, error } = useAdvisorDashboard();

  // New booking alert: shows a toast for each new appointment
  // since the advisor last visited their dashboard.
  useEffect(() => {
    if (!data?.recentAppointments?.length) return;
    const lastSeenId = localStorage.getItem("meti-last-seen-appointment");
    for (const apt of data.recentAppointments) {
      if (apt.id !== lastSeenId) {
        sileo.action({
          title: "🔔 New booking",
          description: `${apt.clientName} booked ${apt.serviceName} for ${format(new Date(apt.scheduledAt), "EEE, MMM d 'at' HH:mm", { locale: enUS })}`,
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
          Overview of your activity as an advisor
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Appointments this week</p>
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
                <p className="text-sm text-[var(--text-muted)]">Active services</p>
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
                <p className="text-sm text-[var(--text-muted)]">Monthly revenue</p>
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
                <p className="text-sm text-[var(--text-muted)]">Rating</p>
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
              <CardTitle className="text-lg">Upcoming appointments</CardTitle>
              <Link
                href="/advisor/schedule"
                className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No scheduled appointments"
                  description="When clients book consultations, they will appear here."
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
                          {format(new Date(apt.scheduledAt), "d MMM, HH:mm", { locale: enUS })}
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
              <CardTitle className="text-lg">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link href="/advisor/services">
                  <Plus className="w-4 h-4 mr-2" />
                  Create service
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                asChild
              >
                <Link href="/advisor/schedule">
                  <Calendar className="w-4 h-4 mr-2" />
                  Set up schedule
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                asChild
              >
                <Link href="/advisor/mercadopago">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Set up payments
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white">
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold mb-2">
                💡 Tip of the day
              </h3>
              <p className="text-sm text-white/90">
                Complete your profile with an introduction video to attract more
                clients. Advisors with a video receive 3x more bookings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
