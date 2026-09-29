#!/usr/bin/env bash
# E2E test server startup (invoked by playwright.config.ts)
set -e

export DATABASE_URL="${DATABASE_URL:-file:./data/e2e.db}"

node scripts/prisma-prepare.mjs
pnpm exec prisma db push --schema .prisma/schema.build.prisma --accept-data-loss

tsx scripts/seed-categories.ts

pnpm exec next build
pnpm exec next start -p 3100
