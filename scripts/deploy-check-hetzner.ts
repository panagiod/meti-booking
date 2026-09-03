#!/usr/bin/env tsx
/**
 * Validate .env for Hetzner VPS deploy.
 * Usage: pnpm deploy:check:hetzner
 *        (loads .env from project root if present)
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { isGoogleOAuthConfigured } from "../src/lib/google-oauth";

const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

type Check = {
  name: string;
  required: boolean;
  ok: boolean;
  hint?: string;
};

function has(name: string): boolean {
  const v = process.env[name]?.trim();
  return Boolean(v && v.length > 0);
}

function urlOk(name: string): boolean {
  const v = process.env[name]?.trim();
  if (!v) return false;
  return v.startsWith("https://") && !v.endsWith("/");
}

const checks: Check[] = [
  { name: "DOMAIN", required: true, ok: has("DOMAIN"), hint: "meti-pilates.com (no https://)" },
  {
    name: "POSTGRES_PASSWORD",
    required: true,
    ok: has("POSTGRES_PASSWORD") && process.env.POSTGRES_PASSWORD !== "change-me-strong-password",
    hint: "Strong password — not the example placeholder",
  },
  {
    name: "DATABASE_URL",
    required: true,
    ok: has("DATABASE_URL") && process.env.DATABASE_URL!.includes("@postgres:"),
    hint: "postgresql://meti:PASSWORD@postgres:5432/meti_booking?schema=public",
  },
  { name: "BETTER_AUTH_SECRET", required: true, ok: has("BETTER_AUTH_SECRET"), hint: "openssl rand -base64 32" },
  {
    name: "BETTER_AUTH_URL",
    required: true,
    ok: urlOk("BETTER_AUTH_URL"),
    hint: "https://yourdomain.com (must match DOMAIN)",
  },
  {
    name: "NEXT_PUBLIC_BETTER_AUTH_URL",
    required: true,
    ok:
      urlOk("NEXT_PUBLIC_BETTER_AUTH_URL") &&
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL === process.env.BETTER_AUTH_URL,
    hint: "Must match BETTER_AUTH_URL exactly",
  },
  { name: "STUDIO_TIMEZONE", required: true, ok: has("STUDIO_TIMEZONE"), hint: "Asia/Nicosia" },
  { name: "CRON_SECRET", required: true, ok: has("CRON_SECRET"), hint: "openssl rand -hex 24" },
  { name: "SELF_HOSTED", required: true, ok: process.env.SELF_HOSTED === "1", hint: "Set SELF_HOSTED=1 for VPS uploads" },
  {
    name: "ENCRYPTION_KEY",
    required: false,
    ok: has("ENCRYPTION_KEY"),
    hint: "Required before Mercado Pago — openssl rand -base64 32",
  },
  {
    name: "APP_URL",
    required: false,
    ok: has("APP_URL"),
    hint: "https://yourdomain.com — for Mercado Pago webhooks",
  },
  {
    name: "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET",
    required: false,
    ok: isGoogleOAuthConfigured(),
    hint: "See deploy/GOOGLE_OAUTH.md",
  },
];

// Cross-check DOMAIN vs BETTER_AUTH_URL
const domain = process.env.DOMAIN?.trim();
const authUrl = process.env.BETTER_AUTH_URL?.trim();
if (domain && authUrl && !authUrl.includes(domain)) {
  checks.push({
    name: "DOMAIN matches BETTER_AUTH_URL",
    required: true,
    ok: false,
    hint: `DOMAIN=${domain} but BETTER_AUTH_URL=${authUrl}`,
  });
}

console.log("Meti Booking — Hetzner VPS environment check\n");

let failedRequired = 0;
let warnings = 0;

for (const check of checks) {
  const icon = check.ok ? "✓" : check.required ? "✗" : "○";
  const label = check.required ? check.name : `${check.name} (optional)`;
  console.log(`${icon} ${label}`);
  if (!check.ok && check.hint) console.log(`    → ${check.hint}`);
  if (!check.ok && check.required) failedRequired++;
  if (!check.ok && !check.required) warnings++;
}

console.log("");

if (failedRequired > 0) {
  console.error(`Failed: ${failedRequired} required variable(s).`);
  console.error("Copy deploy/env.production.example → .env and see deploy/HETZNER.md");
  process.exit(1);
}

if (warnings > 0) {
  console.log(`Ready to deploy with ${warnings} optional gap(s).`);
} else {
  console.log("All checks passed.");
}

console.log("\nNext steps on the VPS:");
console.log("  ./deploy/deploy.sh");
console.log("  ./deploy/setup-cron.sh");
console.log("  ./deploy/smoke-test.sh https://yourdomain.com");
