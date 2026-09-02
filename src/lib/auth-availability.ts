import { isDemoBookingMode } from "@/lib/studio-demo-fallback";

/** Accounts need a live Postgres database — unavailable in demo/preview mode. */
export function isAuthDatabaseAvailable(): boolean {
  return !isDemoBookingMode();
}
