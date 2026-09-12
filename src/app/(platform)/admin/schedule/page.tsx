"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";
import {
  STUDIO_AFTERNOON_START,
  STUDIO_AFTERNOON_END,
  STUDIO_DEFAULT_GAP_MINUTES,
  countSlotsPerDay,
  formatScheduleHoursForLocale,
  weeklyScheduleTemplate,
  type StudioDaySchedule,
} from "@/lib/studio-schedule";
import {
  DEFAULT_BOOKING_WEEKS_AHEAD,
  DEFAULT_CANCEL_HOURS,
  DEFAULT_MAX_UPCOMING_BOOKINGS,
  DEFAULT_SLOT_CAPACITY,
  MAX_BOOKING_WEEKS_AHEAD,
  MAX_CANCEL_HOURS,
  MAX_MAX_UPCOMING_BOOKINGS,
  MAX_SLOT_CAPACITY,
  MIN_BOOKING_WEEKS_AHEAD,
  MIN_CANCEL_HOURS,
  MIN_MAX_UPCOMING_BOOKINGS,
  MIN_SLOT_CAPACITY,
} from "@/lib/booking-config";
import {
  formatMessage,
  useLocale,
  useTranslations,
} from "@/components/providers/locale-provider";
import type { Messages } from "@/i18n";
import { getDateFnsLocale } from "@/lib/date-locale";

function weekdayName(t: Messages["admin"], dayOfWeek: number) {
  return [
    t.weekdaySunday,
    t.weekdayMonday,
    t.weekdayTuesday,
    t.weekdayWednesday,
    t.weekdayThursday,
    t.weekdayFriday,
    t.weekdaySaturday,
  ][dayOfWeek];
}
import { AdminDisclosure } from "@/components/admin/admin-disclosure";
import { AdminWeekBoard } from "@/components/admin/admin-week-board";
import {
  Calendar,
  Clock,
  Save,
  Users,
  Info,
} from "lucide-react";

interface BlockedTime {
  id?: string;
  startDate: string;
  endDate: string;
  isAllDay?: boolean;
}

interface StudioBooking {
  id: string;
  scheduledAt: string;
  status: string;
  durationMin: number;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  isTestBooking: boolean;
}

interface StudioData {
  name: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  slotCapacity: number;
  bookingWeeksAhead: number;
  maxUpcomingBookings: number;
  serviceDurationMin: number;
  serviceName: string;
  cancelHours: number;
  schedules: StudioDaySchedule[];
  blockedTimes: BlockedTime[];
}

export default function AdminSchedulePage() {
  const t = useTranslations();
  const { locale, refreshStudioContent } = useLocale();
  const dialog = useDialog();
  const { showAlert } = dialog;
  const [isLoading, setIsLoading] = useState(true);
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [schedule, setSchedule] = useState<StudioDaySchedule[]>(weeklyScheduleTemplate());
  const [cancelHours, setCancelHours] = useState(DEFAULT_CANCEL_HOURS);
  const [slotCapacity, setSlotCapacity] = useState(DEFAULT_SLOT_CAPACITY);
  const [bookingWeeksAhead, setBookingWeeksAhead] = useState(DEFAULT_BOOKING_WEEKS_AHEAD);
  const [maxUpcomingBookings, setMaxUpcomingBookings] = useState(DEFAULT_MAX_UPCOMING_BOOKINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [blockedTimes, setBlockedTimes] = useState<
    Array<{ startDate: string; endDate: string; isAllDay?: boolean }>
  >([]);
  const [weekBookings, setWeekBookings] = useState<StudioBooking[]>([]);
  const [weekBounds, setWeekBounds] = useState<{ start: string; end: string } | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const loadWeekBookings = useCallback(async (start: string, end: string) => {
    setWeekBounds({ start, end });
    setIsLoadingBookings(true);
    try {
      const res = await fetch(
        `/api/admin/studio/appointments?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      setWeekBookings(data.appointments || []);
    } catch {
      // Calendar hours can still load if booking list fails
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  const refreshBookings = useCallback(async () => {
    if (weekBounds) {
      await loadWeekBookings(weekBounds.start, weekBounds.end);
    }
  }, [loadWeekBookings, weekBounds]);

  const loadStudio = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/studio", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load studio");
      const data = await res.json();
      setStudio(data.studio);
      setSchedule(data.studio.schedules);
      setCancelHours(
        typeof data.studio.cancelHours === "number"
          ? data.studio.cancelHours
          : DEFAULT_CANCEL_HOURS
      );
      setSlotCapacity(
        typeof data.studio.slotCapacity === "number"
          ? data.studio.slotCapacity
          : DEFAULT_SLOT_CAPACITY
      );
      setBookingWeeksAhead(
        typeof data.studio.bookingWeeksAhead === "number"
          ? data.studio.bookingWeeksAhead
          : DEFAULT_BOOKING_WEEKS_AHEAD
      );
      setMaxUpcomingBookings(
        typeof data.studio.maxUpcomingBookings === "number"
          ? data.studio.maxUpcomingBookings
          : DEFAULT_MAX_UPCOMING_BOOKINGS
      );
      setBlockedTimes(data.studio.blockedTimes);
      setHasChanges(false);
    } catch {
      showAlert(t.common.error, t.admin.loadCalendarError, "error");
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, t.admin.loadCalendarError, t.common.error]);

  useEffect(() => {
    loadStudio();
  }, [loadStudio]);

  const activeCount = useMemo(
    () => schedule.filter((d) => d.isActive).length,
    [schedule]
  );

  const summary = useMemo(
    () => formatScheduleHoursForLocale(schedule, locale),
    [schedule, locale]
  );

  const slotsPreview = useMemo(() => {
    const active = schedule.find((d) => d.isActive);
    if (!active || !studio) return null;
    const perDay = countSlotsPerDay(active, studio.serviceDurationMin);
    return {
      perDay,
      perWeek: perDay * activeCount,
      capacity: slotCapacity,
    };
  }, [schedule, activeCount, studio, slotCapacity]);

  const cancelBooking = async (booking: StudioBooking) => {
    const confirmed = await dialog.showConfirm(
      t.admin.cancelBookingTitle,
      formatMessage(t.admin.cancelBookingBody, {
        when: format(new Date(booking.scheduledAt), "d MMM yyyy HH:mm", {
          locale: getDateFnsLocale(locale),
        }),
        name: booking.clientName,
      }),
      "warning"
    );
    if (!confirmed) return;
    setCancellingBookingId(booking.id);
    try {
      const res = await fetch(`/api/appointments/${booking.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: t.admin.cancelReasonAdmin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t.admin.couldNotCancel);
      }
      await refreshBookings();
    } catch (error) {
      dialog.showAlert(
        t.common.error,
        error instanceof Error ? error.message : t.admin.couldNotCancel,
        "error"
      );
    } finally {
      setCancellingBookingId(null);
    }
  };

  const toggleDay = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? {
              ...d,
              isActive: !d.isActive,
              startTime: d.isActive ? d.startTime : STUDIO_AFTERNOON_START,
              endTime: d.isActive ? d.endTime : STUDIO_AFTERNOON_END,
              lunchStart: "",
              lunchEnd: "",
              gapMinutes: STUDIO_DEFAULT_GAP_MINUTES,
            }
          : d
      )
    );
    setHasChanges(true);
  };

  const updateDay = (dayOfWeek: number, patch: Partial<StudioDaySchedule>) => {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d))
    );
    setHasChanges(true);
  };

  const updateTime = (
    dayOfWeek: number,
    field: keyof StudioDaySchedule,
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    );
    setHasChanges(true);
  };

  const saveSchedule = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/studio/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          schedules: schedule,
          cancelHours: Math.trunc(cancelHours),
          slotCapacity: Math.trunc(slotCapacity),
          bookingWeeksAhead: Math.trunc(bookingWeeksAhead),
          maxUpcomingBookings: Math.trunc(maxUpcomingBookings),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        dialog.showAlert(t.common.error, data.error || t.admin.saveScheduleError, "error");
        return;
      }
      setSchedule(data.schedules);
      if (typeof data.cancelHours === "number") {
        setCancelHours(data.cancelHours);
      }
      if (typeof data.slotCapacity === "number") {
        setSlotCapacity(data.slotCapacity);
      }
      if (typeof data.bookingWeeksAhead === "number") {
        setBookingWeeksAhead(data.bookingWeeksAhead);
      }
      if (typeof data.maxUpcomingBookings === "number") {
        setMaxUpcomingBookings(data.maxUpcomingBookings);
      }
      setHasChanges(false);
      await refreshStudioContent();
      dialog.showAlert(t.admin.saved, t.admin.calendarUpdated, "success");
    } catch {
      dialog.showAlert(t.common.error, t.admin.connectionError, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingPage label={t.admin.loadingCalendar} />;
  }

  if (!studio) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)]">
        {t.admin.noStudioConfigured}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            {t.admin.hoursTitle}
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            {formatMessage(t.admin.hoursSub, { name: studio.name })}{" "}
            <Link href="/admin/closures" className="text-[var(--primary)] hover:underline">
              {t.admin.closuresLink}
            </Link>
            .
          </p>
        </div>

        {/* Summary */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--text-muted)]">{t.admin.openDays}</p>
                <p className="font-semibold text-[var(--text-primary)]">{summary}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {activeCount === 1
                    ? t.admin.daysOpenOne
                    : formatMessage(t.admin.daysOpen, { count: activeCount })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Clock className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--text-muted)]">{t.admin.sessionsPerDay}</p>
                <p className="font-semibold text-[var(--text-primary)]">
                  {slotsPreview
                    ? formatMessage(t.admin.timeSlots, { count: slotsPreview.perDay })
                    : "—"}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {formatMessage(t.admin.sessionGap, {
                    duration: studio.serviceDurationMin,
                    gap: STUDIO_DEFAULT_GAP_MINUTES,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Users className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--text-muted)]">{t.admin.capacity}</p>
                <p className="font-semibold text-[var(--text-primary)]">
                  {formatMessage(t.admin.perSlot, { count: slotCapacity })}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {formatMessage(t.admin.instructor, { name: studio.instructorName })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AdminWeekBoard
          schedules={schedule}
          bookings={weekBookings}
          durationMin={studio.serviceDurationMin}
          slotCapacity={slotCapacity}
          blockedTimes={blockedTimes}
          isLoadingBookings={isLoadingBookings}
          onWeekChange={loadWeekBookings}
          onCancel={(id) => {
            const booking = weekBookings.find((item) => item.id === id);
            if (booking) void cancelBooking(booking);
          }}
        />

        <Card className="border-[var(--primary)]/20 bg-[var(--primary-light)]/30">
          <CardContent className="p-4 flex gap-3 text-sm text-[var(--text-primary)]">
            <Info className="w-5 h-5 shrink-0 text-[var(--primary)]" />
            <p>
              {t.admin.hoursHint}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <label
                htmlFor="slot-capacity"
                className="block font-medium text-[var(--text-primary)]"
              >
                {t.admin.slotCapacityLabel}
              </label>
              <div className="flex items-center gap-3">
                <Input
                  id="slot-capacity"
                  type="number"
                  min={MIN_SLOT_CAPACITY}
                  max={MAX_SLOT_CAPACITY}
                  value={slotCapacity}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setSlotCapacity(Number.isFinite(next) ? next : DEFAULT_SLOT_CAPACITY);
                    setHasChanges(true);
                  }}
                  className="h-9 w-24 text-sm"
                />
                <span className="text-sm text-[var(--text-muted)]">
                  {t.admin.slotCapacityUnit}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {t.admin.slotCapacityHint}
              </p>
            </div>
            <div className="space-y-3">
              <label
                htmlFor="booking-weeks"
                className="block font-medium text-[var(--text-primary)]"
              >
                {t.admin.bookingWeeksLabel}
              </label>
              <div className="flex items-center gap-3">
                <Input
                  id="booking-weeks"
                  type="number"
                  min={MIN_BOOKING_WEEKS_AHEAD}
                  max={MAX_BOOKING_WEEKS_AHEAD}
                  value={bookingWeeksAhead}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setBookingWeeksAhead(
                      Number.isFinite(next) ? next : DEFAULT_BOOKING_WEEKS_AHEAD
                    );
                    setHasChanges(true);
                  }}
                  className="h-9 w-24 text-sm"
                />
                <span className="text-sm text-[var(--text-muted)]">
                  {t.admin.bookingWeeksUnit}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {t.admin.bookingWeeksHint}
              </p>
            </div>
            <div className="space-y-3">
              <label
                htmlFor="max-upcoming"
                className="block font-medium text-[var(--text-primary)]"
              >
                {t.admin.maxUpcomingLabel}
              </label>
              <div className="flex items-center gap-3">
                <Input
                  id="max-upcoming"
                  type="number"
                  min={MIN_MAX_UPCOMING_BOOKINGS}
                  max={MAX_MAX_UPCOMING_BOOKINGS}
                  value={maxUpcomingBookings}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setMaxUpcomingBookings(
                      Number.isFinite(next) ? next : DEFAULT_MAX_UPCOMING_BOOKINGS
                    );
                    setHasChanges(true);
                  }}
                  className="h-9 w-24 text-sm"
                />
                <span className="text-sm text-[var(--text-muted)]">
                  {t.admin.maxUpcomingUnit}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {t.admin.maxUpcomingHint}
              </p>
            </div>
            <div className="space-y-3">
              <label
                htmlFor="cancel-hours"
                className="block font-medium text-[var(--text-primary)]"
              >
                {t.admin.cancelHoursLabel}
              </label>
              <div className="flex items-center gap-3">
                <Input
                  id="cancel-hours"
                  type="number"
                  min={MIN_CANCEL_HOURS}
                  max={MAX_CANCEL_HOURS}
                  value={cancelHours}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setCancelHours(Number.isFinite(next) ? next : DEFAULT_CANCEL_HOURS);
                    setHasChanges(true);
                  }}
                  className="h-9 w-24 text-sm"
                />
                <span className="text-sm text-[var(--text-muted)]">
                  {t.admin.cancelHoursUnit}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {t.admin.cancelHoursHint}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly schedule */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              {t.admin.weeklyHours}
            </h2>
            <Button onClick={saveSchedule} disabled={!hasChanges || isSaving || activeCount === 0}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? t.admin.saving : t.admin.saveSchedule}
            </Button>
          </div>

          {[...schedule]
            .sort((a, b) => {
              const order = [1, 2, 3, 4, 5, 6, 0];
              return order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek);
            })
            .map((day) => (
              <AdminDisclosure
                key={day.dayOfWeek}
                className={!day.isActive ? "opacity-60" : undefined}
                title={weekdayName(t.admin, day.dayOfWeek)}
                count={
                  day.isActive
                    ? countSlotsPerDay(day, studio.serviceDurationMin)
                    : undefined
                }
                defaultOpen={day.isActive}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="flex items-center gap-3 md:w-36">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleDay(day.dayOfWeek);
                      }}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative shrink-0",
                        day.isActive ? "bg-[var(--success)]" : "bg-[var(--border)]"
                      )}
                      aria-label={formatMessage(t.admin.toggleDay, {
                        day: weekdayName(t.admin, day.dayOfWeek),
                      })}
                    >
                      <span
                        className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                          day.isActive ? "left-7" : "left-1"
                        )}
                      />
                    </button>
                    {!day.isActive ? (
                      <span className="text-sm italic text-[var(--text-muted)]">
                        {t.admin.closedNotBookable}
                      </span>
                    ) : null}
                  </div>

                  {day.isActive ? (
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">
                            {t.admin.start}
                          </label>
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) =>
                              updateTime(day.dayOfWeek, "startTime", e.target.value)
                            }
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">
                            {t.admin.end}
                          </label>
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) =>
                              updateTime(day.dayOfWeek, "endTime", e.target.value)
                            }
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">
                            {t.admin.gapMin}
                          </label>
                          <Input
                            type="number"
                            min={0}
                            max={120}
                            value={day.gapMinutes}
                            onChange={(e) =>
                              updateDay(day.dayOfWeek, {
                                gapMinutes: Number(e.target.value) || 0,
                              })
                            }
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">
                            {t.admin.lunchStart}
                          </label>
                          <Input
                            type="time"
                            value={day.lunchStart}
                            onChange={(e) =>
                              updateTime(day.dayOfWeek, "lunchStart", e.target.value)
                            }
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">
                            {t.admin.lunchEnd}
                          </label>
                          <Input
                            type="time"
                            value={day.lunchEnd}
                            onChange={(e) =>
                              updateTime(day.dayOfWeek, "lunchEnd", e.target.value)
                            }
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </AdminDisclosure>
            ))}
        </div>
      </div>

      <AlertDialog state={dialog} />
    </>
  );
}
