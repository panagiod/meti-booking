#!/usr/bin/env bash
# Consistent SQLite backup of schedule + customers.
#   ./deploy/backup-studio-data.sh           # write local copies
#   ./deploy/backup-studio-data.sh --stdout  # print encrypted base64 for GitHub Actions
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
[[ -f .env ]] && set -a && source .env && set +a

# shellcheck disable=SC1091
source "${ROOT}/deploy/backup-crypto.sh"

STDOUT=0
if [[ "${1:-}" == "--stdout" ]]; then
  STDOUT=1
fi

DATA_DIR="${METI_DATA_DIR:-/var/lib/meti-booking}"
DB="${DATABASE_URL#file:}"
DB="${DB:-${DATA_DIR}/data.db}"
LOCAL_DIR="${DATA_DIR}/backups"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
DAY="$(date -u +%Y-%m-%d)"

if [[ ! -f "$DB" ]]; then
  echo "ERROR: database not found: $DB" >&2
  exit 1
fi

"${ROOT}/deploy/ensure-backup-key.sh"
# shellcheck disable=SC1091
set -a && source "${ROOT}/.env" && set +a

if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
  echo "ERROR: BACKUP_ENCRYPTION_KEY is missing" >&2
  exit 1
fi

TMP_DB="$(mktemp)"
TMP_ENC="$(mktemp)"
cleanup() {
  rm -f "$TMP_DB" "$TMP_ENC"
}
trap cleanup EXIT

if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB" ".backup '${TMP_DB}'"
else
  cp "$DB" "$TMP_DB"
fi

if [[ ! -s "$TMP_DB" ]]; then
  echo "ERROR: backup file is empty" >&2
  exit 1
fi

meti_encrypt_file "$TMP_DB" "$TMP_ENC" "$BACKUP_ENCRYPTION_KEY"

if [[ "$STDOUT" -eq 1 ]]; then
  echo "METI_BACKUP_DAY=${DAY}"
  echo "METI_BACKUP_SHA256=$(openssl dgst -sha256 -r "$TMP_ENC" | awk '{print $1}')"
  echo "METI_BACKUP_FINGERPRINT=$(meti_key_fingerprint "$BACKUP_ENCRYPTION_KEY")"
  echo "METI_BACKUP_BYTES=$(wc -c <"$TMP_ENC" | tr -d ' ')"
  echo "METI_BACKUP_BEGIN"
  base64 "$TMP_ENC"
  echo "METI_BACKUP_END"
  exit 0
fi

mkdir -p "$LOCAL_DIR" "${ROOT}/deploy/backups"
RAW="${LOCAL_DIR}/sqlite-${STAMP}.db"
ENC="${LOCAL_DIR}/sqlite-${STAMP}.db.enc"
cp "$TMP_DB" "$RAW"
cp "$TMP_ENC" "$ENC"
cp "$TMP_ENC" "${LOCAL_DIR}/latest.db.enc"
cp "$TMP_ENC" "${ROOT}/deploy/backups/sqlite-${STAMP}.db.enc"

echo "Backup: ${ENC}"
echo "Raw copy: ${RAW}"

ls -1t "${LOCAL_DIR}"/sqlite-*.db 2>/dev/null | tail -n +8 | xargs -r rm -f
ls -1t "${LOCAL_DIR}"/sqlite-*.db.enc 2>/dev/null | tail -n +31 | xargs -r rm -f
ls -1t "${ROOT}/deploy/backups"/sqlite-*.db.enc 2>/dev/null | tail -n +8 | xargs -r rm -f
