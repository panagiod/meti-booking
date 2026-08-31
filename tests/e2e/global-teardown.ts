import { cleanupE2EData, disconnectDb } from "../helpers/db";

// Final cleanup: ONLY e2e.* users and their data. Never other records.
export default async function globalTeardown() {
  console.log("[global-teardown] Cleaning up test data...");
  try {
    await cleanupE2EData();
  } finally {
    await disconnectDb();
  }
}
