#!/usr/bin/env bash
# Ensure BACKUP_ENCRYPTION_KEY exists in .env and as a 600 key file.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env"
DATA_DIR="${METI_DATA_DIR:-/var/lib/meti-booking}"
KEY_FILE="${DATA_DIR}/backup.key"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: missing ${ENV_FILE}"
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
  BACKUP_ENCRYPTION_KEY="$(openssl rand -base64 32)"
  printf '\nBACKUP_ENCRYPTION_KEY=%s\n' "$BACKUP_ENCRYPTION_KEY" >>"$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "Generated BACKUP_ENCRYPTION_KEY in ${ENV_FILE}"
fi

mkdir -p "$DATA_DIR"
umask 077
printf '%s' "$BACKUP_ENCRYPTION_KEY" >"$KEY_FILE"
chmod 600 "$KEY_FILE"
