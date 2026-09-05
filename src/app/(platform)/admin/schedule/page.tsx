"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";
import {
  STUDIO_AFTERNOON_START,
  STUDIO_AFTERNOON_END,
  STUDIO_DEFAULT_GAP_MINUTES,
  countSlotsPerDay,
  formatActiveDaysSummary,
  weeklyScheduleTemplate,
  type StudioDaySchedule,
} from "@/lib/studio-schedule";
import { AdminWeekBoard } from "@/components/admin/admin-week-board";
import { upcomingCyprusHolidays } from "@/lib/cyprus-holidays";
import { siteConfig } from "@/lib/site-config";
import {
  Calendar,
  Clock,
  Save,
  Trash2,
  Ban,
  Users,
  Info,
  XCircle,
} from "lucide-react";

interface BlockedTime {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  reason?: string | null;
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
  serviceDurationMin: number;
  serviceName: string;
  schedules: StudioDaySchedule[];
  blockedTimes: BlockedTime[];
}

export default function AdminSchedulePage() {
  const dialog = useDialog();
  const { showAlert } = dialog;
  const [isLoading, setIsLoading] = useState(true);
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [schedule, setSchedule] = useState<StudioDaySchedule[]>(weeklyScheduleTemplate());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [blockTitle, setBlockTitle] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [isBlocking, setIsBlocking] = useState(false);
  const [weekBookings, setWeekBookings] = useState<StudioBooking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<StudioBooking[]>([]);
  const [weekBounds, setWeekBounds] = useState<{ start: string; end: string } | null>(null);
  const [isFreeingSlots, setIsFreeingSlots] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const loadUpcomingBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/studio/appointments", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setUpcomingBookings(data.appointments || []);
    } catch {
      // Week board can still render hours
    }
  }, []);

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
    await loadUpcomingBookings();
    if (weekBounds) {
      await loadWeekBookings(weekBounds.start, weekBounds.end);
    }
  }, [loadUpcomingBookings, loadWeekBookings, weekBounds]);

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
      setBlockedTimes(data.studio.blockedTimes);
      setHasChanges(false);
    } catch {
      showAlert("Error", "Could not load studio calendar", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    loadStudio();
    loadUpcomingBookings();
  }, [loadStudio, loadUpcomingBookings]);

  const activeCount = useMemo(
    () => schedule.filter((d) => d.isActive).length,
    [schedule]
  );

  const summary = useMemo(() => formatActiveDaysSummary(schedule), [schedule]);

  const slotsPreview = useMemo(() => {
    const active = schedule.find((d) => d.isActive);
    if (!active || !studio) return null;
    const perDay = countSlotsPerDay(active, studio.serviceDurationMin);
    return {
      perDay,
      perWeek: perDay * activeCount,
      capacity: siteConfig.slotCapacity,
    };
  }, [schedule, activeCount, studio]);

  const cancelBooking = async (booking: StudioBooking) => {
    const confirmed = await dialog.showConfirm(
      "Cancel booking",
      `Free the ${format(new Date(booking.scheduledAt), "d MMM yyyy HH:mm")} slot for ${booking.clientName}?`,
      "warning"
    );
    if (!confirmed) return;
    setCancellingBookingId(booking.id);
    try {
      const res = await fetch(`/api/appointments/${booking.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by admin" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not cancel booking");
      }
      await refreshBookings();
    } catch (error) {
      dialog.showAlert("Error", error instanceof Error ? error.message : "Could not cancel booking", "error");
    } finally {
      setCancellingBookingId(null);
    }
  };

  const freeAllSlots = async () => {
    const confirmed = await dialog.showConfirm(
      "Free all upcoming slots",
      upcomingBookings.length === 1
        ? "Cancel the 1 upcoming booking and make that slot available again?"
        : `Cancel ${upcomingBookings.length} upcoming bookings and make those slots available again?`,
      "warning"
    );
    if (!confirmed) return;
    setIsFreeingSlots(true);
    try {
      const res = await fetch("/api/admin/studio/appointments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "upcoming" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not free slots");
      }
      const data = await res.json();
      await refreshBookings();
      dialog.showAlert("Slots freed", `${data.cancelled} booking${data.cancelled === 1 ? "" : "s"} cancelled.`, "success");
    } catch (error) {
      dialog.showAlert("Error", error instanceof Error ? error.message : "Could not free slots", "error");
    } finally {
      setIsFreeingSlots(false);
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
        body: JSON.stringify({ schedules: schedule }),
      });
      const data = await res.json();
      if (!res.ok) {
        dialog.showAlert("Error", data.error || "Could not save schedule", "error");
        return;
      }
      setSchedule(data.schedules);
      setHasChanges(false);
      dialog.showAlert("Saved", "Studio calendar updated", "success");
    } catch {
      dialog.showAlert("Error", "Connection error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const addBlock = async () => {
    if (!blockTitle || !blockStart || !blockEnd) {
      dialog.showAlert("Missing fields", "Fill in title and dates", "warning");
      return;
    }

    setIsBlocking(true);
    try {
      const res = await fetch("/api/admin/studio/blocked-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: blockTitle,
          startDate: blockStart,
          endDate: blockEnd,
          isAllDay: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        dialog.showAlert("Error", data.error || "Could not add block", "error");
        return;
      }
      setBlockedTimes((prev) => [...prev, data.blockedTime].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      ));
      setBlockTitle("");
      setBlockStart("");
      setBlockEnd("");
      dialog.showAlert("Blocked", "Dates blocked from booking", "success");
    } catch {
      dialog.showAlert("Error", "Connection error", "error");
    } finally {
      setIsBlocking(false);
    }
  };

  const removeBlock = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/studio/blocked-times?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        dialog.showAlert("Error", "Could not remove block", "error");
        return;
      }
      setBlockedTimes((prev) => prev.filter((b) => b.id !== id));
    } catch {
      dialog.showAlert("Error", "Connection error", "error");
    }
  };

  if (isLoading) {
    return <LoadingPage label="Loading studio calendar" />;
  }

  if (!studio) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)]">
        No studio instructor configured. Run <code>pnpm demo:setup</code>.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            Studio schedule
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            See this week’s sessions and manage when clients can book at {studio.name}
          </p>
        </div>

        {/* Summary */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--text-muted)]">Open days</p>
                <p className="font-semibold text-[var(--text-primary)]">{summary}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {activeCount} day{activeCount === 1 ? "" : "s"} open for booking
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Clock className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--text-muted)]">Sessions per day</p>
                <p className="font-semibold text-[var(--text-primary)]">
                  {slotsPreview?.perDay ?? "—"} time slots
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {studio.serviceDurationMin} min · {STUDIO_DEFAULT_GAP_MINUTES} min gap
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Users className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--text-muted)]">Capacity</p>
                <p className="font-semibold text-[var(--text-primary)]">
                  {studio.slotCapacity} per slot
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Instructor: {studio.instructorName}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AdminWeekBoard
          schedules={schedule}
          bookings={weekBookings}
          durationMin={studio.serviceDurationMin}
          slotCapacity={studio.slotCapacity}
          blockedTimes={blockedTimes}
          isLoadingBookings={isLoadingBookings}
          onWeekChange={loadWeekBookings}
          onCancel={(id) => {
            const booking =
              weekBookings.find((item) => item.id === id) ||
              upcomingBookings.find((item) => item.id === id);
            if (booking) void cancelBooking(booking);
          }}
        />

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
            <CardTitle className="text-lg">Upcoming bookings</CardTitle>
            <Button
              variant="destructive"
              disabled={upcomingBookings.length === 0 || isFreeingSlots}
              onClick={freeAllSlots}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isFreeingSlots ? "Freeing slots…" : "Free all upcoming slots"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--text-muted)]">
              Cancel a session to release that reformer slot on the public calendar.
            </p>
            {upcomingBookings.length === 0 ? (
              <p className="text-sm italic text-[var(--text-muted)]">No upcoming bookings holding slots.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
                {upcomingBookings.map((booking) => (
                  <li key={booking.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {format(new Date(booking.scheduledAt), "EEE d MMM yyyy · HH:mm")}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {booking.serviceName} · {booking.clientName} · {booking.clientEmail}
                        {booking.isTestBooking ? " · test" : ""}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={cancellingBookingId === booking.id}
                      onClick={() => cancelBooking(booking)}
                    >
                      {cancellingBookingId === booking.id ? "Cancelling…" : "Cancel & free slot"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--primary)]/20 bg-[var(--primary-light)]/30">
          <CardContent className="p-4 flex gap-3 text-sm text-[var(--text-primary)]">
            <Info className="w-5 h-5 shrink-0 text-[var(--primary)]" />
            <p>
              Toggle the days you want open each week (e.g. Monday, Wednesday, Saturday).
              Set start and end times per day. Changes apply immediately on the public
              booking calendar after you save.
            </p>
          </CardContent>
        </Card>

        {/* Weekly schedule */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              Weekly hours
            </h2>
            <Button onClick={saveSchedule} disabled={!hasChanges || isSaving || activeCount === 0}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving…" : "Save schedule"}
            </Button>
          </div>

          {schedule
            .sort((a, b) => {
              const order = [1, 2, 3, 4, 5, 6, 0];
              return order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek);
            })
            .map((day) => (
              <Card key={day.dayOfWeek} className={!day.isActive ? "opacity-60" : ""}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 md:w-44">
                      <button
                        type="button"
                        onClick={() => toggleDay(day.dayOfWeek)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative shrink-0",
                          day.isActive ? "bg-[var(--success)]" : "bg-[var(--border)]"
                        )}
                        aria-label={`Toggle ${day.dayName}`}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                            day.isActive ? "left-7" : "left-1"
                          )}
                        />
                      </button>
                      <span className="font-medium text-[var(--text-primary)]">
                        {day.dayName}
                      </span>
                    </div>

                    {day.isActive ? (
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1">
                              Start
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
                              End
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
                              Gap (min)
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
                          <div className="flex items-end gap-2 text-sm text-[var(--text-muted)] pb-2">
                            <Clock className="w-4 h-4" />
                            {countSlotsPerDay(day, studio.serviceDurationMin)} slots
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-[var(--text-muted)] mb-1">
                              Lunch start (optional)
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
                              Lunch end (optional)
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
                    ) : (
                      <p className="text-sm text-[var(--text-muted)] italic flex-1">
                        Closed — not bookable
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Blocked dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ban className="w-5 h-5" />
              Block dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              Cyprus public holidays are blocked automatically. Use this for vacations or extra
              studio closures. Blocked days won&apos;t appear on the public booking calendar.
            </p>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                Cyprus public holidays
              </p>
              <ul className="mt-2 divide-y divide-[var(--border)]">
                {upcomingCyprusHolidays().map((holiday) => (
                  <li key={holiday.date} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="font-medium text-[var(--text-primary)]">{holiday.name}</span>
                    <span className="text-[var(--text-muted)]">
                      {format(new Date(`${holiday.date}T12:00:00`), "EEE d MMM yyyy")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-[var(--text-muted)] mb-1">Title</label>
                <Input
                  placeholder="e.g. Studio holiday"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">From</label>
                <Input
                  type="date"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">To</label>
                <Input
                  type="date"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={addBlock} disabled={isBlocking} variant="secondary">
              <Ban className="w-4 h-4 mr-2" />
              {isBlocking ? "Adding…" : "Block dates"}
            </Button>

            {blockedTimes.length > 0 ? (
              <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
                {blockedTimes.map((bt) => (
                  <li
                    key={bt.id}
                    className="flex items-center justify-between gap-3 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{bt.title}</p>
                      <p className="text-[var(--text-muted)]">
                        {format(new Date(bt.startDate), "MMM d, yyyy")}
                        {" – "}
                        {format(new Date(bt.endDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBlock(bt.id)}
                      className="text-[var(--danger)] hover:text-[var(--danger)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--text-muted)] italic">No blocked dates</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog state={dialog} />
    </>
  );
}
