#!/usr/bin/env bash
# Backup SQLite database (lite deploy).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
[[ -f .env ]] && source .env

DATA_DIR="${METI_DATA_DIR:-/var/lib/meti-booking}"
DB="${DATABASE_URL#file:}"
DB="${DB:-${DATA_DIR}/data.db}"
BACKUP_DIR="${ROOT}/deploy/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"
if [[ ! -f "$DB" ]]; then
  echo "Database not found: $DB"
  exit 1
fi

cp "$DB" "${BACKUP_DIR}/sqlite-${STAMP}.db"
echo "Backup: ${BACKUP_DIR}/sqlite-${STAMP}.db"

# Keep last 14 backups
ls -1t "${BACKUP_DIR}"/sqlite-*.db 2>/dev/null | tail -n +15 | xargs -r rm -f
