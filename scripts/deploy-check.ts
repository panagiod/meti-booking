#!/usr/bin/env tsx
/**
 * Validate environment variables before Vercel/production deploy.
 * Usage: pnpm deploy:check
 *        DATABASE_URL=... BETTER_AUTH_URL=... pnpm deploy:check
 */
import { isGoogleOAuthConfigured } from "../src/lib/google-oauth";

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

function isPlaceholder(name: string, placeholders: string[]): boolean {
  const v = process.env[name]?.trim();
  return !v || placeholders.includes(v);
}

const checks: Check[] = [
  {
    name: "DATABASE_URL",
    required: true,
    ok: has("DATABASE_URL"),
    hint: "Neon pooled Postgres URL with ?sslmode=require",
  },
  {
    name: "BETTER_AUTH_SECRET",
    required: true,
    ok: has("BETTER_AUTH_SECRET"),
    hint: "openssl rand -base64 32",
  },
  {
    name: "BETTER_AUTH_URL",
    required: true,
    ok: has("BETTER_AUTH_URL") && !process.env.BETTER_AUTH_URL!.includes("localhost"),
    hint: "https://your-app.vercel.app (no trailing slash)",
  },
  {
    name: "NEXT_PUBLIC_BETTER_AUTH_URL",
    required: true,
    ok:
      has("NEXT_PUBLIC_BETTER_AUTH_URL") &&
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL === process.env.BETTER_AUTH_URL,
    hint: "Must match BETTER_AUTH_URL exactly",
  },
  {
    name: "STUDIO_TIMEZONE",
    required: true,
    ok: has("STUDIO_TIMEZONE"),
    hint: "Asia/Nicosia",
  },
  {
    name: "CRON_SECRET",
    required: true,
    ok: has("CRON_SECRET"),
    hint: "openssl rand -hex 24",
  },
  {
    name: "ENCRYPTION_KEY",
    required: false,
    ok: has("ENCRYPTION_KEY"),
    hint: "Required before advisors connect Mercado Pago",
  },
  {
    name: "BLOB_READ_WRITE_TOKEN",
    required: false,
    ok: has("BLOB_READ_WRITE_TOKEN"),
    hint: "Required for admin CMS image uploads in production",
  },
  {
    name: "APP_URL",
    required: false,
    ok: has("APP_URL"),
    hint: "Public URL for Mercado Pago return/webhook URLs",
  },
  {
    name: "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET",
    required: false,
    ok: isGoogleOAuthConfigured(),
    hint: "See deploy/GOOGLE_OAUTH.md — email/password works without Google",
  },
];

console.log("Meti Booking — deploy environment check\n");

let failedRequired = 0;
let warnings = 0;

for (const check of checks) {
  const icon = check.ok ? "✓" : check.required ? "✗" : "○";
  const label = check.required ? check.name : `${check.name} (optional)`;
  console.log(`${icon} ${label}`);
  if (!check.ok && check.hint) {
    console.log(`    → ${check.hint}`);
  }
  if (!check.ok && check.required) failedRequired++;
  if (!check.ok && !check.required) warnings++;
}

console.log("");

if (failedRequired > 0) {
  console.error(`Failed: ${failedRequired} required variable(s) missing or invalid.`);
  console.error("See deploy/VERCEL.md and .env.example");
  process.exit(1);
}

if (warnings > 0) {
  console.log(`Ready to deploy with ${warnings} optional gap(s).`);
} else {
  console.log("All checks passed.");
}

console.log("\nNext steps:");
console.log("  1. vercel.com/new → import panagiod/meti-booking");
console.log("  2. Paste env vars → Deploy");
console.log("  3. DATABASE_URL=... pnpm db:deploy");
console.log("  4. Smoke test /book, /login, /admin");
