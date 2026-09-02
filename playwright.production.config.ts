import { defineConfig } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL || "https://meti-pilates.com";

export default defineConfig({
  testDir: "./tests/production",
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
});
