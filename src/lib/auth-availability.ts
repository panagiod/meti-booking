import { isDemoBookingMode } from "@/lib/studio-demo-fallback";

/** Accounts need a live SQLite database — unavailable in demo/preview mode. */
export function isAuthDatabaseAvailable(): boolean {
  return !isDemoBookingMode();
}
