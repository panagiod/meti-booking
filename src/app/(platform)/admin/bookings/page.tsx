import { AdminUpcomingBookings } from "@/components/admin/admin-upcoming-bookings";

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Bookings
        </h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Upcoming sessions, who is coming, and free a slot if someone cannot attend
        </p>
      </div>
      <AdminUpcomingBookings />
    </div>
  );
}
