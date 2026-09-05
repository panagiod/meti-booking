#!/usr/bin/env bash
# Production deploy on the VPS (used by CI/CD — fully automatic).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
LOG_DIR="/var/log/meti-booking"
LOG_FILE="${LOG_DIR}/deploy.log"

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

echo ""
echo "=========================================="
echo "Deploy started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
echo "=========================================="

chmod +x deploy/*.sh

# --- Bootstrap (first deploy / fresh server) ---
if ! command -v node >/dev/null 2>&1 || ! command -v caddy >/dev/null 2>&1; then
  echo "==> First-time server setup (Node + Caddy)..."
  ./deploy/install-lite.sh
fi

if [[ ! -f .env ]]; then
  echo "==> Creating .env (lite / SQLite)..."
  ./deploy/init-env-lite.sh
fi

if grep -q '^STUDIO_TIMEZONE=' .env; then
  sed -i 's|^STUDIO_TIMEZONE=.*|STUDIO_TIMEZONE=Asia/Nicosia|' .env
else
  echo 'STUDIO_TIMEZONE=Asia/Nicosia' >> .env
fi

./deploy/fix-env-syntax.sh .env
./deploy/validate-env.sh .env

# shellcheck disable=SC1091
set -a
source .env
set +a

export DEPLOY_MODE="${DEPLOY_MODE:-lite}"

if [[ "${DEPLOY_MODE}" == "lite" ]]; then
  echo "Deploy mode: lite (no Docker, SQLite)"
  ./deploy/deploy-lite.sh
else
  echo "Deploy mode: docker (PostgreSQL)"
  ./deploy/deploy.sh
fi

# Cron (idempotent — rewrites /etc/cron.d/meti-booking)
echo "==> Installing cron jobs..."
./deploy/setup-cron.sh || true
chmod +x deploy/backup-studio-data.sh deploy/restore-studio-data.sh deploy/ensure-backup-key.sh deploy/ci-deploy-wrapper.sh
./deploy/ensure-backup-key.sh || true

# Wait for app after deploy-lite restart
echo "==> Waiting for app..."
LOCAL_CODE="000"
for i in $(seq 1 30); do
  LOCAL_CODE="$(curl -fsS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo 000)"
  if [[ "$LOCAL_CODE" =~ ^(200|307|308)$ ]]; then
    break
  fi
  sleep 2
done
echo "  http://127.0.0.1:3000 → HTTP ${LOCAL_CODE}"

if [[ ! "$LOCAL_CODE" =~ ^(200|307|308)$ ]]; then
  echo "ERROR: App not responding on port 3000"
  journalctl -u meti-booking -n 30 --no-pager || true
  exit 1
fi

# Seed studio if /api/studio not ready (idempotent)
./deploy/ensure-studio-seed.sh

echo "==> Ensure studio owner is ADMIN..."
pnpm exec tsx scripts/ensure-studio-admin.ts || true

# Sync CMS to bundled hero/reformer files (picks up image updates from git)
pnpm exec tsx scripts/sync-bundled-images.ts || true

if [[ -n "${DOMAIN:-}" ]]; then
  echo "==> Health check (public)..."
  if ! ./deploy/smoke-test.sh "https://${DOMAIN}"; then
    echo "ERROR: Public smoke test failed"
    exit 1
  fi
  echo "Public smoke test passed."
fi

echo "==> Free leftover automated test bookings..."
pnpm exec tsx scripts/cancel-test-bookings.ts || true

echo "Deploy finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
