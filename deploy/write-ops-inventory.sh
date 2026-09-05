#!/usr/bin/env bash
# Print a non-secret inventory of this studio server (never dumps .env values).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  set -a && source .env && set +a
fi

DATA_DIR="${METI_DATA_DIR:-/var/lib/meti-booking}"
DB="${DATABASE_URL#file:}"
DB="${DB:-${DATA_DIR}/data.db}"
PUBLIC_IP="$(curl -fsS --max-time 5 https://api4.ipify.org 2>/dev/null || true)"

cat <<EOF
generated_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
public_repo=panagiod/meti-booking
domain=${DOMAIN:-meti-pilates.com}
timezone=${STUDIO_TIMEZONE:-Asia/Nicosia}
deploy_mode=${DEPLOY_MODE:-lite}
payments_enabled=${PAYMENTS_ENABLED:-0}
hostname=$(hostname)
public_ip=${PUBLIC_IP:-unknown}
user=$(whoami)
app_dir=${ROOT}
data_dir=${DATA_DIR}
database_path=${DB}
systemd_service=meti-booking
node_version=$(node -v 2>/dev/null || echo unknown)
git_commit=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)
service_active=$(systemctl is-active meti-booking 2>/dev/null || echo unknown)
EOF
