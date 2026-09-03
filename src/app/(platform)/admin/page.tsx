"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import { useAdminDashboard } from "@/lib/hooks";
import { Users, Calendar, TrendingUp } from "lucide-react";
import { AdminDashboardSchedule } from "@/components/admin/admin-dashboard-schedule";

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) return <LoadingPage />;

  const stats = data?.stats || {
    totalUsers: 0,
    todayAppointments: 0,
    completedToday: 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Studio overview
        </h1>
        <p className="text-[var(--text-muted)] mt-1">This week’s schedule and today’s sessions</p>
      </div>

      <AdminDashboardSchedule />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[var(--accent-light)]">
                <Calendar className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Sessions today</p>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[var(--primary-light)]">
                <Users className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Total users</p>
                <p className="text-xl font-heading font-bold text-[var(--text-primary)]">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
