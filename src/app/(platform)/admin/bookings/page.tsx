"use client";

import { AdminUpcomingBookings } from "@/components/admin/admin-upcoming-bookings";
import { useTranslations } from "@/components/providers/locale-provider";

export default function AdminBookingsPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          {t.admin.bookingsTitle}
        </h1>
        <p className="mt-1 text-[var(--text-muted)]">{t.admin.bookingsSub}</p>
      </div>
      <AdminUpcomingBookings />
    </div>
  );
}
