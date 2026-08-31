import { cleanupE2EData, disconnectDb } from "../tests/helpers/db";

// Manual cleanup of e2e.* users (test data only, never others).
async function main() {
  console.log("[test-cleanup] Removing e2e.* users from the test database...");
  const deleted = await cleanupE2EData();
  await disconnectDb();
  console.log(`[test-cleanup] Complete (${deleted} users removed).`);
}

main();
