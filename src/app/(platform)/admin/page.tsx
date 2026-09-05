"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import { useAdminDashboard } from "@/lib/hooks";
import { Users, Calendar, TrendingUp, ArrowRight, ClipboardList, Clock, Ban } from "lucide-react";
import Link from "next/link";
import { AdminDashboardSchedule } from "@/components/admin/admin-dashboard-schedule";
import { useTranslations } from "@/components/providers/locale-provider";

export default function AdminDashboard() {
  const t = useTranslations();
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) return <LoadingPage label={t.admin.loading} />;

  const stats = data?.stats || {
    totalUsers: 0,
    todayAppointments: 0,
    completedToday: 0,
    upcomingAppointments: 0,
  };

  const shortcuts = [
    {
      href: "/admin/bookings",
      title: t.admin.shortcutBookings,
      description: t.admin.shortcutBookingsSub,
      icon: ClipboardList,
    },
    {
      href: "/admin/users",
      title: t.admin.shortcutClients,
      description: t.admin.shortcutClientsSub,
      icon: Users,
    },
    {
      href: "/admin/schedule",
      title: t.admin.shortcutHours,
      description: t.admin.shortcutHoursSub,
      icon: Clock,
    },
    {
      href: "/admin/closures",
      title: t.admin.shortcutClosures,
      description: t.admin.shortcutClosuresSub,
      icon: Ban,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          {t.admin.overviewTitle}
        </h1>
        <p className="text-[var(--text-muted)] mt-1">{t.admin.overviewSub}</p>
      </div>

      <Link href="/book">
        <Card className="hover:shadow-lg transition-all cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-1">
                  {t.admin.bookForClientTitle}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{t.admin.bookForClientSub}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
            </div>
          </CardContent>
        </Card>
      </Link>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {shortcuts.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4">
                <item.icon className="w-5 h-5 text-[var(--primary)] mb-2" />
                <p className="font-heading font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                  {item.title}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <AdminDashboardSchedule />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[var(--accent-light)]">
                <Calendar className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">{t.admin.sessionsToday}</p>
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
                <p className="text-sm text-[var(--text-muted)]">{t.admin.completedToday}</p>
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
                <ClipboardList className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">{t.admin.upcoming}</p>
                <p className="text-xl font-heading font-bold text-[var(--text-primary)]">
                  {stats.upcomingAppointments}
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
                <p className="text-sm text-[var(--text-muted)]">{t.admin.clients}</p>
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
