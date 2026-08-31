"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import Link from "next/link";
import { useAdminDashboard } from "@/lib/hooks";
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Calendar,
} from "lucide-react";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(cents);
}

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) return <LoadingPage />;

  const stats = data?.stats || {
    activeAdvisors: 0,
    pendingAdvisors: 0,
    totalUsers: 0,
    monthRevenue: 0,
    monthFees: 0,
    todayAppointments: 0,
    completedToday: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Dashboard Admin
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Platform overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Active advisors</p>
                <p className="text-2xl font-heading font-bold text-[var(--text-primary)] mt-1">
                  {stats.activeAdvisors}
                </p>
                {stats.pendingAdvisors > 0 && (
                  <p className="text-xs text-[var(--warning)] mt-1">
                    {stats.pendingAdvisors} pending
                  </p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-[var(--primary-light)]">
                <Briefcase className="w-5 h-5 text-[var(--primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Total users</p>
                <p className="text-2xl font-heading font-bold text-[var(--text-primary)] mt-1">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--accent-light)]">
                <Users className="w-5 h-5 text-[var(--accent)]" />
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
                  {formatCurrency(stats.monthRevenue)}
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
                <p className="text-sm text-[var(--text-muted)]">Fee recaudado</p>
                <p className="text-2xl font-heading font-bold text-[var(--text-primary)] mt-1">
                  {formatCurrency(stats.monthFees)}
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
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent advisors</CardTitle>
              <Link
                href="/admin/advisors"
                className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {data?.recentAdvisors?.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No advisors yet"
                  description="When professionals sign up, they will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {data?.recentAdvisors?.map((advisor: any) => (
                    <div
                      key={advisor.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--background)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                          <span className="font-medium text-[var(--primary)]">
                            {advisor.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {advisor.name}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {advisor.speciality}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          advisor.status === "active"
                            ? "bg-[var(--success-light)] text-[var(--success)]"
                            : "bg-[var(--warning-light)] text-[var(--warning)]"
                        }`}
                      >
                        {advisor.status === "active" ? "Active" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[var(--accent-light)]">
                  <Calendar className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Appointments today</p>
                  <p className="text-xl font-heading font-bold text-[var(--text-primary)]">
                    {stats.todayAppointments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[var(--success-light)]">
                  <TrendingUp className="w-5 h-5 text-[var(--success)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Completed today</p>
                  <p className="text-xl font-heading font-bold text-[var(--text-primary)]">
                    {stats.completedToday}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
