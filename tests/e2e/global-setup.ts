import { cleanupE2EData, disconnectDb } from "../helpers/db";

// Defensive purge: removes orphaned e2e.* users from a previous run
// (idempotent; only touches test users).
export default async function globalSetup() {
  console.log("[global-setup] Purging orphaned e2e users...");
  await cleanupE2EData();
  await disconnectDb();
}
