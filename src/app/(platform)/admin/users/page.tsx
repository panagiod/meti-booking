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
  countUnpaidCents,
  countUpcomingSessions,
  countYearClasses,
  filterAdminUsers,
  normalizeAdminUserRole,
  sortAdminUsers,
  summarizeAdminUsers,
  type AdminUserAppointment,
  type AdminUserBookingFilter,
  type AdminUserListItem,
} from "@/lib/admin-users";
import { groupAttendanceDatesByMonth } from "@/lib/client-attendance";
import { formatMoney } from "@/lib/format";
import { isPayableSessionStatus, isSessionPaid } from "@/lib/session-payment";
import { formatStudioDate, formatStudioDateTime, parseStudioDateInput } from "@/lib/timezone";
import { formatStudioPhone, isPublicPhone, studioTelHref } from "@/lib/site-config";
import { CalendarDays, ChevronDown, Mail, Phone, Search, Users } from "lucide-react";
import { sileo } from "sileo";
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

function monthHeading(month: string, locale: "en" | "el"): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return formatStudioDate(
    new Date(Date.UTC(year, monthNumber - 1, 15, 12, 0, 0)),
    { month: "long", year: "numeric" },
    locale
  );
}

function ClientCard({
  user,
  t,
  locale,
  onPaymentUpdated,
}: {
  user: AdminUserListItem;
  t: Messages["admin"];
  locale: "en" | "el";
  onPaymentUpdated: () => void;
}) {
  const next = user.upcoming[0];
  const last = user.recent[0];
  const yearCount = user.yearCount ?? 0;
  const unpaidCents = user.unpaidCents ?? 0;
  const yearLabel =
    yearCount === 1
      ? t.yearClassCountOne
      : formatMessage(t.yearClassCount, { count: yearCount });
  const months = groupAttendanceDatesByMonth(user.yearDates ?? []);

  return (
    <details className="group rounded-lg bg-[var(--background)]">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)]">
              <span className="font-medium text-[var(--primary)]">{user.name?.charAt(0) || "?"}</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-[var(--text-primary)]">
                  {user.name || t.unnamedClient}
                </h3>
                <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role, t)}</Badge>
              </div>
              <div className="mt-1 flex flex-col gap-1 text-sm text-[var(--text-muted)] sm:flex-row sm:flex-wrap sm:gap-x-4">
                <a
                  href={`mailto:${user.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </a>
                {isPublicPhone(user.phone) ? (
                  <a
                    href={studioTelHref(user.phone)}
                    className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)]"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {formatStudioPhone(user.phone)}
                  </a>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{yearLabel}</p>
              {unpaidCents > 0 ? (
                <p className="mt-1 text-xs font-medium text-[var(--error)]">
                  {formatMessage(t.unpaidAmount, { amount: formatMoney(unpaidCents, locale) })}
                </p>
              ) : null}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm lg:min-w-[16rem]">
            {next ? (
              <>
                <p className="text-xs text-[var(--text-muted)]">{t.nextSession}</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {formatStudioDateTime(new Date(next.scheduledAt), locale)}
                </p>
              </>
            ) : last ? (
              <>
                <p className="text-xs text-[var(--text-muted)]">{t.lastSession}</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {formatStudioDateTime(new Date(last.scheduledAt), locale)}
                </p>
              </>
            ) : (
              <p className="text-[var(--text-muted)]">{t.noSessionsYet}</p>
            )}
          </div>
        </div>
        <ChevronDown className="mt-2 h-5 w-5 shrink-0 text-[var(--text-muted)] transition group-open:rotate-180" />
      </summary>

      <div className="space-y-3 border-t border-[var(--border)] px-4 pb-4 pt-3">
        <details className="rounded-lg border border-[var(--border)]">
          <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
            {t.upcomingSection} ({user.upcoming.length})
          </summary>
          <div className="px-3 pb-3">
            {user.upcoming.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t.noUpcomingSessions}</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {user.upcoming.map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                    t={t}
                    locale={locale}
                  />
                ))}
              </ul>
            )}
          </div>
        </details>

        <details className="rounded-lg border border-[var(--border)]">
          <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
            {t.completedSection} ({yearCount})
          </summary>
          <div className="space-y-3 px-3 pb-3">
            {yearCount === 0 && user.recent.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t.noCompletedYet}</p>
            ) : (
              <>
                {yearCount > 0 ? (
                <div>
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {t.yearDates}
                  </p>
                  <div className="space-y-2">
                    {months.map((group) => (
                      <div key={group.month}>
                        <p className="text-xs font-medium text-[var(--text-muted)]">
                          {monthHeading(group.month, locale)}
                        </p>
                        <p className="text-sm text-[var(--text-primary)]">
                          {group.dates
                            .map((date) =>
                              formatStudioDate(parseStudioDateInput(date) ?? new Date(`${date}T12:00:00Z`), {
                                day: "numeric",
                                month: "short",
                              }, locale)
                            )
                            .join(" · ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                ) : null}
                {user.recent.length > 0 ? (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {t.latestCompleted}
                    </p>
                    <ul className="divide-y divide-[var(--border)]">
                      {user.recent.map((appointment) => (
                        <AppointmentRow
                          key={appointment.id}
                          appointment={appointment}
                          t={t}
                          locale={locale}
                          clientName={user.name}
                          showPayment
                          onPaymentUpdated={onPaymentUpdated}
                        />
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </details>
      </div>
    </details>
  );
}

function AppointmentRow({
  appointment,
  t,
  locale,
  clientName,
  showPayment = false,
  onPaymentUpdated,
}: {
  appointment: AdminUserAppointment;
  t: Messages["admin"];
  locale: "en" | "el";
  clientName?: string;
  showPayment?: boolean;
  onPaymentUpdated?: () => void;
}) {
  const payable = showPayment && isPayableSessionStatus(appointment.status);
  const paid = isSessionPaid(appointment);
  const [paidByName, setPaidByName] = useState(appointment.paidByName || clientName || "");
  const [saving, setSaving] = useState(false);
  const amount =
    typeof appointment.totalCents === "number" && appointment.totalCents > 0
      ? formatMoney(appointment.totalCents, locale)
      : null;

  async function savePayment(paidNext: boolean) {
    const name = paidByName.trim() || clientName?.trim() || "";
    if (paidNext && !name) {
      sileo.error({ title: t.paidByRequired });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/appointments/${appointment.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: paidNext, paidByName: name }),
      });
      if (!res.ok) {
        throw new Error("payment");
      }
      sileo.success({ title: paidNext ? t.paymentSaved : t.paymentCleared });
      onPaymentUpdated?.();
    } catch {
      sileo.error({ title: t.paymentError });
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex flex-col gap-2 py-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {formatStudioDateTime(new Date(appointment.scheduledAt), locale)}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {appointment.serviceName} · {formatMessage(t.minutes, { count: appointment.durationMin })}
            {amount ? ` · ${amount}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={statusBadgeVariant(appointment.status)}>
            {appointmentStatusLabel(appointment.status, statusLabels(t))}
          </Badge>
          {payable ? (
            <Badge variant={paid ? "success" : "warning"}>
              {paid ? t.sessionPaid : t.sessionUnpaid}
            </Badge>
          ) : null}
        </div>
      </div>
      {payable ? (
        paid ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--text-muted)]">
              {formatMessage(t.paidBy, { name: appointment.paidByName || paidByName })}
              {appointment.paidAt
                ? ` · ${formatStudioDate(
                    new Date(appointment.paidAt),
                    { day: "numeric", month: "short" },
                    locale
                  )}`
                : ""}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={() => void savePayment(false)}
            >
              {saving ? t.savingPayment : t.markUnpaid}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={paidByName}
              onChange={(event) => setPaidByName(event.target.value)}
              placeholder={t.paidByPlaceholder}
              aria-label={t.paidByPlaceholder}
              className="h-8 max-w-56 text-xs"
              disabled={saving}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void savePayment(true);
                }
              }}
            />
            <Button
              type="button"
              variant="success"
              size="sm"
              disabled={saving}
              onClick={() => void savePayment(true)}
            >
              {saving ? t.savingPayment : t.markPaid}
            </Button>
          </div>
        )
      ) : null}
    </li>
  );
}

export default function UsersPage() {
  const t = useTranslations();
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [bookingFilter, setBookingFilter] = useState<AdminUserBookingFilter>("all");
  const { data, isLoading, isError, refetch } = useAdminUsers();

  const users = useMemo(
    () =>
      ((data?.users || []) as AdminUserListItem[]).map((user) => ({
        ...user,
        upcoming: user.upcoming ?? [],
        recent: user.recent ?? [],
        yearCount: user.yearCount ?? 0,
        yearDates: user.yearDates ?? [],
        unpaidCents: user.unpaidCents ?? 0,
      })),
    [data?.users]
  );
  const totals = summarizeAdminUsers(users);
  const upcomingCount = countUpcomingSessions(users);
  const yearClasses = countYearClasses(users);
  const unpaidTotal = countUnpaidCents(users);
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

  if (isError) {
    return (
      <EmptyState
        icon={Users}
        title={t.common.error}
        description={t.admin.clientsLoadError}
        action={{ label: t.admin.clientsRetry, onClick: () => void refetch() }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          {t.admin.clientsTitle}
        </h1>
        <p className="text-[var(--text-muted)] mt-1">{t.admin.clientsSub}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
            <p className="text-sm text-[var(--text-muted)]">{t.admin.yearClasses}</p>
            <p className="text-2xl font-heading font-bold text-[var(--success)]">
              {yearClasses}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">{t.admin.unpaidTotal}</p>
            <p className="text-2xl font-heading font-bold text-[var(--error)]">
              {formatMoney(unpaidTotal, locale)}
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
            <Button
              variant={bookingFilter === "unpaid" ? "default" : "secondary"}
              size="sm"
              onClick={() => setBookingFilter("unpaid")}
            >
              {t.admin.filterUnpaid}
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
            <div className="space-y-3">
              {visibleUsers.map((user) => (
                <ClientCard
                  key={user.id}
                  user={user}
                  t={t.admin}
                  locale={locale}
                  onPaymentUpdated={() => void refetch()}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
