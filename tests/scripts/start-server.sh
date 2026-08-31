#!/usr/bin/env bash
# E2E test server startup (invoked by playwright.config.ts)
set -e

# Pre-warm the Neon DB (first connect wakes the suspended compute)
node -e "const{Client}=require('pg');const c=new Client({connectionString:process.env.DATABASE_URL});c.connect().then(()=>c.query('SELECT 1')).then(()=>c.end()).catch(e=>{console.error('warmup:',e.message);process.exit(1)})"

# Migrations with retry (advisory lock may take time on a cold compute)
migrated=0
for i in 1 2 3; do
  if pnpm exec prisma migrate deploy; then
    migrated=1
    break
  fi
  echo "[start-server] migrate deploy failed (attempt $i), retrying..."
  sleep 5
done
if [ "$migrated" != "1" ]; then
  echo "[start-server] migrate deploy failed after 3 attempts" >&2
  exit 1
fi

# Category seed (idempotent)
tsx scripts/seed-categories.ts

# Isolated production build (NEXT_DIST_DIR) and start on the test port
pnpm exec next build
pnpm exec next start -p 3100
