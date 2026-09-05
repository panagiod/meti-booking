#!/usr/bin/env bash
# Restore the live SQLite database from an encrypted backup.
# Usage:
#   CONFIRM=RESTORE ./deploy/restore-studio-data.sh /path/to/2026-09-05.db.enc
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

if [[ "${CONFIRM:-}" != "RESTORE" ]]; then
  echo "Refusing to restore. Re-run with CONFIRM=RESTORE" >&2
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
