"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { formatStudioDateTime } from "@/lib/timezone";
import { CalendarPlus, XCircle } from "lucide-react";

export interface AdminStudioBooking {
  id: string;
  scheduledAt: string;
  status: string;
  durationMin: number;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  isTestBooking: boolean;
}

export function AdminUpcomingBookings() {
  const dialog = useDialog();
  const [bookings, setBookings] = useState<AdminStudioBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFreeingSlots, setIsFreeingSlots] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/studio/appointments", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setBookings(data.appointments || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cancelBooking = async (booking: AdminStudioBooking) => {
    const confirmed = await dialog.showConfirm(
      "Cancel booking",
      `Free the ${formatStudioDateTime(new Date(booking.scheduledAt))} slot for ${booking.clientName}?`,
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
      await load();
    } catch (error) {
      dialog.showAlert("Error", error instanceof Error ? error.message : "Could not cancel booking", "error");
    } finally {
      setCancellingBookingId(null);
    }
  };

  const freeAllSlots = async () => {
    const confirmed = await dialog.showConfirm(
      "Free all upcoming slots",
      bookings.length === 1
        ? "Cancel the 1 upcoming booking and make that slot available again?"
        : `Cancel ${bookings.length} upcoming bookings and make those slots available again?`,
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
      await load();
      dialog.showAlert(
        "Slots freed",
        `${data.cancelled} booking${data.cancelled === 1 ? "" : "s"} cancelled.`,
        "success"
      );
    } catch (error) {
      dialog.showAlert("Error", error instanceof Error ? error.message : "Could not free slots", "error");
    } finally {
      setIsFreeingSlots(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Upcoming bookings</CardTitle>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {isLoading ? "Loading…" : `${bookings.length} holding a reformer place`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/book">
                <CalendarPlus className="w-4 h-4 mr-2" />
                Book for a client
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={bookings.length === 0 || isFreeingSlots}
              onClick={freeAllSlots}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isFreeingSlots ? "Freeing…" : "Free all upcoming"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[var(--text-muted)]">
            Cancel a session to release that reformer slot on the public calendar.
          </p>
          {bookings.length === 0 && !isLoading ? (
            <p className="text-sm italic text-[var(--text-muted)]">No upcoming bookings holding slots.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {formatStudioDateTime(new Date(booking.scheduledAt))}
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
      <AlertDialog state={dialog} />
    </>
  );
}
