"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminWeekBoard } from "@/components/admin/admin-week-board";
import type { StudioDaySchedule } from "@/lib/studio-schedule";

interface StudioBooking {
  id: string;
  scheduledAt: string;
  status: string;
  clientName: string;
  clientEmail: string;
}

interface StudioPreview {
  schedules: StudioDaySchedule[];
  serviceDurationMin: number;
  slotCapacity: number;
  blockedTimes: Array<{ startDate: string; endDate: string; isAllDay?: boolean }>;
}

export function AdminDashboardSchedule() {
  const [studio, setStudio] = useState<StudioPreview | null>(null);
  const [bookings, setBookings] = useState<StudioBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/studio", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setStudio(data.studio);
      } catch {
        // Dashboard still works without the week preview
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadBookings = useCallback(async (start: string, end: string) => {
    setIsLoadingBookings(true);
    try {
      const res = await fetch(
        `/api/admin/studio/appointments?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`,
        { credentials: "include", cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setBookings(data.appointments || []);
    } catch {
      // Week board still shows open hours
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  if (!studio) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
          Studio schedule
        </h2>
        <Link
          href="/admin/schedule"
          className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
        >
          Manage calendar <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <AdminWeekBoard
        schedules={studio.schedules}
        bookings={bookings}
        durationMin={studio.serviceDurationMin}
        slotCapacity={studio.slotCapacity}
        blockedTimes={studio.blockedTimes}
        isLoadingBookings={isLoadingBookings}
        onWeekChange={loadBookings}
      />
    </div>
  );
}
