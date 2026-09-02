#!/usr/bin/env bash
# Seed studio data on lite (SQLite) deploy.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
set -a
source .env
set +a

if [[ "${ALLOW_DEMO_SEED:-0}" != "1" ]]; then
  echo "Set ALLOW_DEMO_SEED=1 in .env first"
  exit 1
fi

if [[ "${DATABASE_URL:-}" != file:* ]]; then
  echo "ERROR: Lite seed needs SQLite DATABASE_URL."
  echo "  Current: ${DATABASE_URL:-<unset>}"
  echo "  Fix: FORCE=1 ./deploy/init-env-lite.sh"
  exit 1
fi

export DEPLOY_MODE=lite

node scripts/prisma-prepare.mjs
pnpm exec prisma generate --schema .prisma/schema.build.prisma
ALLOW_DEMO_SEED=1 pnpm demo:setup
