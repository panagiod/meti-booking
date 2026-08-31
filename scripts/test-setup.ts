import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

config({ path: resolve(__dirname, "../.env.test") });

const env = { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL! };

console.log("[test-setup] Applying migrations to the test database...");
execSync("pnpm exec prisma migrate deploy", { env, stdio: "inherit" });

console.log("[test-setup] Seeding categories in the test database...");
execSync("tsx scripts/seed-categories.ts", { env, stdio: "inherit" });

console.log("[test-setup] Done.");
