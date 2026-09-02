#!/usr/bin/env bash
# Lightweight production deploy — no Docker, SQLite on disk (~150MB RAM at runtime).
# Run from repo root: ./deploy/deploy-lite.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — run: ./deploy/init-env-lite.sh"
  exit 1
fi

# shellcheck disable=SC1091
./deploy/fix-env-syntax.sh .env
./deploy/validate-env.sh .env
set -a
source .env
set +a

DATA_DIR="${METI_DATA_DIR:-/var/lib/meti-booking}"
export DATABASE_URL="${DATABASE_URL:-file:${DATA_DIR}/data.db}"
export SELF_HOSTED="${SELF_HOSTED:-1}"
export DEPLOY_MODE=lite
export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2560}"

for var in DOMAIN BETTER_AUTH_SECRET BETTER_AUTH_URL CRON_SECRET; do
  if [[ -z "${!var:-}" ]]; then
    echo "Missing required env var: $var"
    exit 1
  fi
done

mkdir -p "$DATA_DIR"
mkdir -p "${ROOT}/public/uploads/studio"

if ! command -v node >/dev/null; then
  echo "Node.js not found. Run: ./deploy/install-lite.sh"
  exit 1
fi

corepack enable 2>/dev/null || true

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> SQLite schema..."
node scripts/prisma-prepare.mjs
pnpm exec prisma db push --schema .prisma/schema.build.prisma

echo "==> Building Next.js (standalone)..."
pnpm build

STANDALONE="${ROOT}/.next/standalone"
if [[ ! -f "${STANDALONE}/server.js" ]]; then
  echo "ERROR: Standalone build missing at ${STANDALONE}/server.js"
  exit 1
fi

echo "==> Syncing static assets..."
cp -r "${ROOT}/public" "${STANDALONE}/public"
mkdir -p "${STANDALONE}/.next"
cp -r "${ROOT}/.next/static" "${STANDALONE}/.next/static"

echo "==> Caddy + systemd..."
"${ROOT}/deploy/setup-caddy-lite.sh"
cp "${ROOT}/deploy/meti-booking.service" /etc/systemd/system/meti-booking.service
systemctl daemon-reload
systemctl enable meti-booking caddy
systemctl restart meti-booking
systemctl reload caddy 2>/dev/null || systemctl restart caddy

echo ""
echo "Lite deploy complete."
echo "  Site: https://${DOMAIN}"
echo "  Database: ${DATABASE_URL}"
echo ""
echo "First time: set ALLOW_DEMO_SEED=1 in .env, then ./deploy/seed-lite.sh"
