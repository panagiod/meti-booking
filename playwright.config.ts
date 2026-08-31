import { defineConfig } from "@playwright/test";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, ".env.test") });

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL!;
const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3100";
const PORT = new URL(BASE_URL).port;

// Fixed secret for the test suite (CI has no .env; locally it overrides dev)
const TEST_AUTH_SECRET = "meti-e2e-better-auth-secret-7f3c9a1e5b8d2046e9a1c7f3b5d9e2a4";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  // The suite shares the same test DB: strictly serial execution
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  webServer: {
    // next dev has a per-project lock: if the user already has a dev server running,
    // we use an isolated production build (separate distDir via NEXT_DIST_DIR)
    // and `next start` on the test port.
    command: "bash tests/scripts/start-server.sh",
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 600_000,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      PORT,
      BETTER_AUTH_URL: BASE_URL,
      NEXT_PUBLIC_BETTER_AUTH_URL: BASE_URL,
      APP_URL: BASE_URL,
      NEXT_DIST_DIR: "test-results/.next-test",
      DISABLE_RATE_LIMIT: "1",
      BETTER_AUTH_SECRET: TEST_AUTH_SECRET,
    },
  },
});
