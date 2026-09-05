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

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PATH:-}"

sqlite_eval() {
  local file="$1"
  local sql="$2"
  python3 -c '
import sqlite3, sys
con = sqlite3.connect(sys.argv[1])
try:
    row = con.execute(sys.argv[2]).fetchone()
    print("" if row is None else row[0])
except sqlite3.Error:
    print("missing")
' "$file" "$sql"
}

TMP_DB="$(mktemp)"
trap 'rm -f "$TMP_DB"' EXIT

echo "Decrypting ${ENC_FILE} ($(wc -c <"$ENC_FILE" | tr -d ' ') bytes)"
meti_decrypt_file "$ENC_FILE" "$TMP_DB" "$BACKUP_ENCRYPTION_KEY"

if [[ "$(head -c 15 "$TMP_DB")" != "SQLite format 3" ]]; then
  echo "ERROR: decrypted file is not a SQLite database ($(wc -c <"$TMP_DB" | tr -d ' ') bytes)" >&2
  exit 1
fi

integrity="$(sqlite_eval "$TMP_DB" "PRAGMA integrity_check")"
if [[ "$integrity" != "ok" ]]; then
  echo "ERROR: SQLite integrity_check failed: ${integrity}" >&2
  exit 1
fi

count_table() {
  local file="$1"
  local table="$2"
  sqlite_eval "$file" "SELECT COUNT(*) FROM \"${table}\""
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

mkdir -p "${DATA_DIR}/backups"
SAFETY=""
RESTART=0

if systemctl is-active --quiet meti-booking 2>/dev/null; then
  echo "Stopping meti-booking so the live database is idle..."
  systemctl stop meti-booking
  RESTART=1
fi

if [[ -f "$DB" ]]; then
  SAFETY="${DATA_DIR}/backups/pre-restore-$(date -u +%Y%m%d-%H%M%S).db"
  cp "$DB" "$SAFETY"
  echo "Saved current database to ${SAFETY}"
fi

cp "$TMP_DB" "$DB"
chmod 600 "$DB"
rm -f "${DB}-wal" "${DB}-shm"
echo "Replaced ${DB} and removed WAL/SHM sidecars"

rollback_live() {
  if [[ -n "$SAFETY" && -f "$SAFETY" ]]; then
    echo "Rolling back to ${SAFETY}"
    cp "$SAFETY" "$DB"
    chmod 600 "$DB"
    rm -f "${DB}-wal" "${DB}-shm"
  fi
  if [[ "$RESTART" -eq 1 ]]; then
    systemctl start meti-booking || true
  fi
}

if [[ "$RESTART" -eq 1 ]]; then
  if ! systemctl start meti-booking; then
    rollback_live
    echo "ERROR: meti-booking failed to start after restore" >&2
    exit 1
  fi
fi

ok=0
for _ in $(seq 1 30); do
  code="$(curl -fsS -o /dev/null -w "%{http_code}" --max-time 3 http://127.0.0.1:3000/api/health 2>/dev/null || echo 000)"
  if [[ "$code" == "200" ]]; then
    ok=1
    break
  fi
  sleep 1
done

if [[ "$ok" -ne 1 ]]; then
  rollback_live
  echo "ERROR: /api/health did not return 200 after restore" >&2
  exit 1
fi

echo "Restored ${DB} from ${ENC_FILE}"
echo "Health check passed on http://127.0.0.1:3000/api/health"
