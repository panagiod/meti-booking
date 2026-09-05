"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { useAdminUsers } from "@/lib/hooks";
import {
  appointmentStatusLabel,
  countUpcomingSessions,
  filterAdminUsers,
  normalizeAdminUserRole,
  sortAdminUsers,
  summarizeAdminUsers,
  type AdminUserAppointment,
  type AdminUserBookingFilter,
  type AdminUserListItem,
} from "@/lib/admin-users";
import { formatStudioDate, formatStudioDateTime } from "@/lib/timezone";
import { formatStudioPhone, isPublicPhone, studioTelHref } from "@/lib/site-config";
import { CalendarDays, Mail, Phone, Search, Users } from "lucide-react";
import {
  formatMessage,
  useLocale,
  useTranslations,
} from "@/components/providers/locale-provider";
import type { Messages } from "@/i18n";

function roleLabel(role: string, t: Messages["admin"]): string {
  const normalized = normalizeAdminUserRole(role);
  if (normalized === "admin") return t.roleAdmin;
  if (normalized === "instructor") return t.roleInstructor;
  return t.roleClient;
}

function statusLabels(t: Messages["admin"]): Partial<Record<string, string>> {
  return {
    CONFIRMED: t.statusConfirmed,
    PENDING: t.statusPending,
    IN_PROGRESS: t.statusInProgress,
    COMPLETED: t.statusCompleted,
    CANCELLED: t.statusCancelled,
    NO_SHOW: t.statusNoShow,
  };
}

function roleBadgeVariant(role: string): "default" | "secondary" | "outline" {
  const normalized = normalizeAdminUserRole(role);
  if (normalized === "admin") return "default";
  if (normalized === "instructor") return "outline";
  return "secondary";
}

function statusBadgeVariant(
  status: string
): "success" | "warning" | "destructive" | "secondary" | "outline" {
  const value = status.trim().toUpperCase();
  if (value === "CONFIRMED" || value === "COMPLETED") return "success";
  if (value === "PENDING" || value === "IN_PROGRESS") return "warning";
  if (value === "CANCELLED" || value === "NO_SHOW") return "destructive";
  return "outline";
}

function AppointmentRow({
  appointment,
  t,
  locale,
}: {
  appointment: AdminUserAppointment;
  t: Messages["admin"];
  locale: "en" | "el";
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-1.5 text-sm">
      <div>
        <p className="font-medium text-[var(--text-primary)]">
          {formatStudioDateTime(new Date(appointment.scheduledAt), locale)}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {appointment.serviceName} · {formatMessage(t.minutes, { count: appointment.durationMin })}
        </p>
      </div>
      <Badge variant={statusBadgeVariant(appointment.status)}>
        {appointmentStatusLabel(appointment.status, statusLabels(t))}
      </Badge>
    </li>
  );
}

export default function UsersPage() {
  const t = useTranslations();
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [bookingFilter, setBookingFilter] = useState<AdminUserBookingFilter>("all");
  const { data, isLoading } = useAdminUsers();

  const users = useMemo(
    () =>
      ((data?.users || []) as AdminUserListItem[]).map((user) => ({
        ...user,
        upcoming: user.upcoming ?? [],
        recent: user.recent ?? [],
      })),
    [data?.users]
  );
  const totals = summarizeAdminUsers(users);
  const upcomingCount = countUpcomingSessions(users);
  const visibleUsers = useMemo(
    () =>
      sortAdminUsers(
        filterAdminUsers(users, {
          role: roleFilter,
          search: searchQuery,
          bookings: bookingFilter,
        })
      ),
    [users, roleFilter, searchQuery, bookingFilter]
  );

  if (isLoading) return <LoadingPage label={t.admin.loading} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          {t.admin.clientsTitle}
        </h1>
        <p className="text-[var(--text-muted)] mt-1">{t.admin.clientsSub}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">{t.admin.people}</p>
            <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
              {totals.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">{t.admin.clients}</p>
            <p className="text-2xl font-heading font-bold text-[var(--accent)]">
              {totals.clients}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">{t.admin.upcomingSessions}</p>
            <p className="text-2xl font-heading font-bold text-[var(--success)]">
              {upcomingCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">{t.admin.admins}</p>
            <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
              {totals.admins}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input
                placeholder={t.admin.searchPeople}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={roleFilter === "all" ? "default" : "secondary"}
                size="sm"
                onClick={() => setRoleFilter("all")}
              >
                {t.admin.filterAll}
              </Button>
              <Button
                variant={roleFilter === "client" ? "default" : "secondary"}
                size="sm"
                onClick={() => setRoleFilter("client")}
              >
                {t.admin.filterClients}
              </Button>
              <Button
                variant={roleFilter === "admin" ? "default" : "secondary"}
                size="sm"
                onClick={() => setRoleFilter("admin")}
              >
                {t.admin.filterAdmins}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={bookingFilter === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => setBookingFilter("all")}
            >
              {t.admin.filterAllBookings}
            </Button>
            <Button
              variant={bookingFilter === "upcoming" ? "default" : "secondary"}
              size="sm"
              onClick={() => setBookingFilter("upcoming")}
            >
              {t.admin.filterHasUpcoming}
            </Button>
            <Button
              variant={bookingFilter === "none" ? "default" : "secondary"}
              size="sm"
              onClick={() => setBookingFilter("none")}
            >
              {t.admin.filterNoUpcoming}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {formatMessage(
              visibleUsers.length === 1 ? t.admin.personCount : t.admin.peopleCount,
              { count: visibleUsers.length }
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visibleUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title={users.length === 0 ? t.admin.noClientsYet : t.admin.noMatchingPeople}
              description={
                users.length === 0 ? t.admin.noClientsYetSub : t.admin.noMatchingPeopleSub
              }
            />
          ) : (
            <div className="space-y-4">
              {visibleUsers.map((user) => {
                const next = user.upcoming[0];
                const last = user.recent[0];
                return (
                  <div
                    key={user.id}
                    className="rounded-lg bg-[var(--background)] p-4 space-y-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                          <span className="font-medium text-[var(--primary)]">
                            {user.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-[var(--text-primary)]">
                              {user.name || t.admin.unnamedClient}
                            </h3>
                            <Badge variant={roleBadgeVariant(user.role)}>
                              {roleLabel(user.role, t.admin)}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-col gap-1 text-sm text-[var(--text-muted)] sm:flex-row sm:flex-wrap sm:gap-x-4">
                            <a
                              href={`mailto:${user.email}`}
                              className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)]"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              {user.email}
                            </a>
                            {isPublicPhone(user.phone) ? (
                              <a
                                href={studioTelHref(user.phone)}
                                className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)]"
                              >
                                <Phone className="h-3.5 w-3.5" />
                                {formatStudioPhone(user.phone)}
                              </a>
                            ) : null}
                          </div>
                          {user.joinDate ? (
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              {formatMessage(t.admin.joined, {
                                date: formatStudioDate(new Date(user.joinDate), undefined, locale),
                              })}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm lg:min-w-[16rem]">
                        {next ? (
                          <>
                            <p className="text-xs text-[var(--text-muted)]">{t.admin.nextSession}</p>
                            <p className="font-medium text-[var(--text-primary)]">
                              {formatStudioDateTime(new Date(next.scheduledAt), locale)}
                            </p>
                          </>
                        ) : last ? (
                          <>
                            <p className="text-xs text-[var(--text-muted)]">{t.admin.lastSession}</p>
                            <p className="font-medium text-[var(--text-primary)]">
                              {formatStudioDateTime(new Date(last.scheduledAt), locale)}
                            </p>
                          </>
                        ) : (
                          <p className="text-[var(--text-muted)]">{t.admin.noSessionsYet}</p>
                        )}
                      </div>
                    </div>

                    {user.upcoming.length > 0 ? (
                      <div>
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatMessage(t.admin.upcomingCount, { count: user.upcoming.length })}
                        </p>
                        <ul className="divide-y divide-[var(--border)]">
                          {user.upcoming.map((appointment) => (
                            <AppointmentRow
                              key={appointment.id}
                              appointment={appointment}
                              t={t.admin}
                              locale={locale}
                            />
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {user.recent.length > 0 ? (
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                          {t.admin.recentHistory}
                        </p>
                        <ul className="divide-y divide-[var(--border)]">
                          {user.recent.map((appointment) => (
                            <AppointmentRow
                              key={appointment.id}
                              appointment={appointment}
                              t={t.admin}
                              locale={locale}
                            />
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
