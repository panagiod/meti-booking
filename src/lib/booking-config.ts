import { siteConfig } from "@/lib/site-config";

/** Studio default — single source of truth (also in `siteConfig.defaultBookingLeadHours`). */
export const DEFAULT_BOOKING_LEAD_HOURS = siteConfig.defaultBookingLeadHours;

/** Free cancellation window. Admin can change this; stored on each service. */
export const DEFAULT_CANCEL_HOURS = 12;
export const MIN_CANCEL_HOURS = 1;
export const MAX_CANCEL_HOURS = 72;

/**
 * Effective minimum hours before the first bookable slot.
 *
 * - `0` → no lead-time restriction (any open slot is bookable).
 * - positive number → stored advisor value.
 * - `null` / `undefined` → {@link DEFAULT_BOOKING_LEAD_HOURS}.
 */
export function resolveBookingLeadHours(stored: number | null | undefined): number {
  if (stored === 0) return 0;
  if (stored != null && Number.isFinite(stored) && stored > 0) {
    return Math.trunc(stored);
  }
  return DEFAULT_BOOKING_LEAD_HOURS;
}

export function resolveCancelHours(stored: number | null | undefined): number {
  if (stored != null && Number.isFinite(stored)) {
    const hours = Math.trunc(stored);
    if (hours >= MIN_CANCEL_HOURS && hours <= MAX_CANCEL_HOURS) return hours;
  }
  return DEFAULT_CANCEL_HOURS;
}

/** People per class. Admin can change this; stored on the studio instructor. */
export const DEFAULT_SLOT_CAPACITY: number = siteConfig.slotCapacity;
export const MIN_SLOT_CAPACITY = 1;
export const MAX_SLOT_CAPACITY = 12;

export function resolveSlotCapacity(stored: number | null | undefined): number {
  if (stored != null && Number.isFinite(stored)) {
    const count = Math.trunc(stored);
    if (count >= MIN_SLOT_CAPACITY && count <= MAX_SLOT_CAPACITY) return count;
  }
  return DEFAULT_SLOT_CAPACITY;
}

/** How many weeks ahead clients can book. Admin can change this. */
export const DEFAULT_BOOKING_WEEKS_AHEAD: number = siteConfig.bookingWeeksAhead;
export const MIN_BOOKING_WEEKS_AHEAD = 1;
export const MAX_BOOKING_WEEKS_AHEAD = 16;
/** One date per day in the longest admin booking window (16 weeks). */
export const MAX_BOOKING_WINDOW_DAYS = MAX_BOOKING_WEEKS_AHEAD * 7;

export function resolveBookingWeeksAhead(stored: number | null | undefined): number {
  if (stored != null && Number.isFinite(stored)) {
    const weeks = Math.trunc(stored);
    if (weeks >= MIN_BOOKING_WEEKS_AHEAD && weeks <= MAX_BOOKING_WEEKS_AHEAD) return weeks;
  }
  return DEFAULT_BOOKING_WEEKS_AHEAD;
}

/** How many upcoming sessions one client can hold. Admin can change this. */
export const DEFAULT_MAX_UPCOMING_BOOKINGS = 8;
export const MIN_MAX_UPCOMING_BOOKINGS = 1;
export const MAX_MAX_UPCOMING_BOOKINGS = 40;

export function resolveMaxUpcomingBookings(stored: number | null | undefined): number {
  if (stored != null && Number.isFinite(stored)) {
    const count = Math.trunc(stored);
    if (count >= MIN_MAX_UPCOMING_BOOKINGS && count <= MAX_MAX_UPCOMING_BOOKINGS) {
      return count;
    }
  }
  return DEFAULT_MAX_UPCOMING_BOOKINGS;
}

/** How many new bookings one client can make in 24 hours. Admin can change this. */
export const DEFAULT_DAILY_BOOKING_LIMIT = 8;
export const MIN_DAILY_BOOKING_LIMIT = 1;
export const MAX_DAILY_BOOKING_LIMIT = 40;

export function resolveDailyBookingLimit(stored: number | null | undefined): number {
  if (stored != null && Number.isFinite(stored)) {
    const count = Math.trunc(stored);
    if (count >= MIN_DAILY_BOOKING_LIMIT && count <= MAX_DAILY_BOOKING_LIMIT) {
      return count;
    }
  }
  return DEFAULT_DAILY_BOOKING_LIMIT;
}
