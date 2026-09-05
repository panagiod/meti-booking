#!/usr/bin/env bash
# Restore the live SQLite database from an encrypted backup.
# Usage:
#   CONFIRM=RESTORE ./deploy/restore-studio-data.sh /path/to/2026-09-05.db.enc
#   CONFIRM=VERIFY  ./deploy/restore-studio-data.sh /path/to/2026-09-05.db.enc
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
[[ -f .env ]] && set -a && source .env && set +a

# shellcheck disable=SC1091
source "${ROOT}/deploy/backup-crypto.sh"

ENC_FILE="${1:-}"
if [[ -z "$ENC_FILE" || ! -f "$ENC_FILE" ]]; then
  echo "Usage: CONFIRM=RESTORE $0 /path/to/backup.db.enc" >&2
  exit 1
fi

if [[ "${CONFIRM:-}" != "RESTORE" && "${CONFIRM:-}" != "VERIFY" ]]; then
  echo "Refusing to restore. Re-run with CONFIRM=RESTORE or CONFIRM=VERIFY" >&2
  exit 1
fi

DATA_DIR="${METI_DATA_DIR:-/var/lib/meti-booking}"
DB="${DATABASE_URL#file:}"
DB="${DB:-${DATA_DIR}/data.db}"

"${ROOT}/deploy/ensure-backup-key.sh"
# shellcheck disable=SC1091
set -a && source "${ROOT}/.env" && set +a

if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
  echo "ERROR: BACKUP_ENCRYPTION_KEY is missing" >&2
  exit 1
fi

TMP_DB="$(mktemp)"
trap 'rm -f "$TMP_DB"' EXIT

meti_decrypt_file "$ENC_FILE" "$TMP_DB" "$BACKUP_ENCRYPTION_KEY"

if ! command -v sqlite3 >/dev/null 2>&1 || ! sqlite3 "$TMP_DB" "SELECT COUNT(*) FROM sqlite_master;" >/dev/null; then
  echo "ERROR: decrypted file is not a valid SQLite database" >&2
  exit 1
fi

integrity="$(sqlite3 "$TMP_DB" "PRAGMA integrity_check;")"
if [[ "$integrity" != "ok" ]]; then
  echo "ERROR: SQLite integrity_check failed: ${integrity}" >&2
  exit 1
fi

count_table() {
  local file="$1"
  local table="$2"
  sqlite3 "$file" "SELECT COUNT(*) FROM \"${table}\";" 2>/dev/null || echo "missing"
}

echo "Decrypted backup is a valid SQLite database (integrity_check=ok)"
for table in appointments users instructor_schedules instructor_profiles studio_content blocked_times; do
  backup_count="$(count_table "$TMP_DB" "$table")"
  live_count="n/a"
  if [[ -f "$DB" ]]; then
    live_count="$(count_table "$DB" "$table")"
  fi
  echo "  ${table}: backup=${backup_count} live=${live_count}"
done

if [[ "${CONFIRM}" == "VERIFY" ]]; then
  echo "VERIFY only — live database was not replaced."
  exit 0
fi

mkdir -p "$DATA_DIR"
if [[ -f "$DB" ]]; then
  SAFETY="${DATA_DIR}/backups/pre-restore-$(date -u +%Y%m%d-%H%M%S).db"
  mkdir -p "${DATA_DIR}/backups"
  cp "$DB" "$SAFETY"
  echo "Saved current database to ${SAFETY}"
fi

if systemctl is-active --quiet meti-booking 2>/dev/null; then
  systemctl stop meti-booking
  RESTART=1
else
  RESTART=0
fi

cp "$TMP_DB" "$DB"
chmod 600 "$DB"

if [[ "$RESTART" -eq 1 ]]; then
  systemctl start meti-booking
fi

echo "Restored ${DB} from ${ENC_FILE}"
