#!/usr/bin/env bash
# Production deploy on the VPS (used by CI/CD and manual runs).
# Assumes repo is already at the desired git ref (ci-deploy-wrapper pulls first).
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

if [[ ! -f .env ]]; then
  echo "ERROR: Missing .env — run ./deploy/init-env.sh once on the server."
  exit 1
fi

./deploy/deploy.sh

# shellcheck disable=SC1091
set -a
source .env
set +a

if [[ -n "${DOMAIN:-}" ]]; then
  ./deploy/smoke-test.sh "https://${DOMAIN}"
else
  echo "WARN: DOMAIN not set — skipping smoke test"
fi

echo "Deploy finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
