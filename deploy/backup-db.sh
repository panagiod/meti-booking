#!/usr/bin/env bash
# Backup Postgres to deploy/backups/ (run daily via cron on the VPS).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
set -a
source .env
set +a

BACKUP_DIR="$ROOT/deploy/backups"
mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/meti-booking-${STAMP}.sql.gz"

echo "Backing up to $FILE ..."
docker compose -f deploy/docker-compose.prod.yml exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-meti}" "${POSTGRES_DB:-meti_booking}" | gzip > "$FILE"

# Keep last 14 daily backups
ls -1t "$BACKUP_DIR"/meti-booking-*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm --

echo "Backup complete."
