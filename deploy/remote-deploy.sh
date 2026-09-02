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

# Cron (idempotent)
if [[ ! -f /etc/cron.d/meti-booking ]]; then
  echo "==> Installing cron jobs..."
  ./deploy/setup-cron.sh
fi

# Auto-seed empty database (first deploy only)
DATA_DIR="${METI_DATA_DIR:-/var/lib/meti-booking}"
DB_FILE="${DATABASE_URL#file:}"
DB_FILE="${DB_FILE:-${DATA_DIR}/data.db}"
if [[ -f "$DB_FILE" ]] && command -v sqlite3 >/dev/null 2>&1; then
  USER_COUNT="$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo 0)"
  if [[ "${USER_COUNT}" == "0" ]]; then
    echo "==> Empty database — seeding studio data..."
    if ! grep -q '^DEMO_PASSWORD=' .env 2>/dev/null; then
      DEMO_PW="$(openssl rand -base64 12)"
      echo "DEMO_PASSWORD=${DEMO_PW}" >> .env
      echo "Generated DEMO_PASSWORD saved to .env (for admin/instructor login)"
    fi
    if ! grep -q '^ALLOW_DEMO_SEED=1' .env 2>/dev/null; then
      echo "ALLOW_DEMO_SEED=1" >> .env
    fi
    # shellcheck disable=SC1091
    source .env
    ./deploy/seed-lite.sh
    sed -i 's/^ALLOW_DEMO_SEED=.*/ALLOW_DEMO_SEED=0/' .env
  fi
fi

# Health checks
echo "==> Health check (local)..."
LOCAL_CODE="$(curl -fsS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo 000)"
echo "  http://127.0.0.1:3000 → HTTP ${LOCAL_CODE}"

if [[ "$LOCAL_CODE" =~ ^(200|307|308)$ ]] && [[ -n "${DOMAIN:-}" ]]; then
  echo "==> Health check (public)..."
  if ./deploy/smoke-test.sh "https://${DOMAIN}"; then
    echo "Public smoke test passed."
  else
    echo "WARN: Public HTTPS check failed (often Cloudflare DNS/proxy). App is up locally."
    echo "  Fix: Cloudflare → DNS → grey cloud on A record, or wait for DNS."
  fi
elif [[ ! "$LOCAL_CODE" =~ ^(200|307|308)$ ]]; then
  echo "ERROR: App not responding on port 3000"
  journalctl -u meti-booking -n 30 --no-pager || true
  exit 1
fi

echo "Deploy finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
