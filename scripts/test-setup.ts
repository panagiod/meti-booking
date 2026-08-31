import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

config({ path: resolve(__dirname, "../.env.test") });

const env = { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL! };

console.log("[test-setup] Aplicando migraciones a la DB de pruebas...");
execSync("pnpm exec prisma migrate deploy", { env, stdio: "inherit" });

console.log("[test-setup] Poblando categorías en la DB de pruebas...");
execSync("tsx scripts/seed-categories.ts", { env, stdio: "inherit" });

console.log("[test-setup] Listo.");
