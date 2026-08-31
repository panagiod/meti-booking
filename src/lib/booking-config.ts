import { siteConfig } from "@/lib/site-config";

/** Studio default — single source of truth (also in `siteConfig.defaultBookingLeadHours`). */
export const DEFAULT_BOOKING_LEAD_HOURS = siteConfig.defaultBookingLeadHours;

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
