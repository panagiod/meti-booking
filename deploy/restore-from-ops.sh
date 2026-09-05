#!/usr/bin/env bash
# Pull an encrypted backup from the private ops repo and restore this VPS.
#   CONFIRM=RESTORE ./deploy/restore-from-ops.sh [latest|YYYY-MM-DD]
#   CONFIRM=VERIFY  ./deploy/restore-from-ops.sh [latest|YYYY-MM-DD]  # decrypt + check only
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DAY="${1:-latest}"

if [[ "${CONFIRM:-}" != "RESTORE" && "${CONFIRM:-}" != "VERIFY" ]]; then
  echo "Refusing to restore. Re-run with CONFIRM=RESTORE or CONFIRM=VERIFY" >&2
  exit 1
fi

# shellcheck disable=SC1091
[[ -f .env ]] && set -a && source .env && set +a
# shellcheck disable=SC1091
source "${ROOT}/deploy/backup-crypto.sh"

OPS_REPO="${OPS_REPO:-panagiod/meti-studio-ops}"

if [[ -z "${OPS_REPO_TOKEN:-}" ]]; then
  echo "ERROR: OPS_REPO_TOKEN is missing from .env" >&2
  exit 1
fi

if [[ ! "$DAY" =~ ^(latest|[0-9]{4}-[0-9]{2}-[0-9]{2})$ ]]; then
  echo "ERROR: backup day must be latest or YYYY-MM-DD" >&2
  exit 1
fi

WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

git clone --depth 1 "https://x-access-token:${OPS_REPO_TOKEN}@github.com/${OPS_REPO}.git" "$WORK/ops" >/dev/null
if [[ "$DAY" == "latest" ]]; then
  ENC="$WORK/ops/backups/latest.db.enc"
else
  ENC="$WORK/ops/backups/${DAY}.db.enc"
fi

if [[ ! -s "$ENC" ]]; then
  echo "ERROR: backup not found in ${OPS_REPO}: backups/${DAY}.db.enc" >&2
  exit 1
fi

if head -c 128 "$ENC" | grep -q 'git-lfs.github.com'; then
  echo "Encrypted database is a Git LFS pointer ($(wc -c <"$ENC" | tr -d ' ') bytes). Fetching the real file..."
  if ! command -v git-lfs >/dev/null 2>&1; then
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get install -y git-lfs
    git lfs install --skip-repo
  fi
  git -C "$WORK/ops" lfs pull --include="backups/*"
fi

echo "Backup file: ${ENC} ($(wc -c <"$ENC" | tr -d ' ') bytes)"
if ! head -c 8 "$ENC" | grep -q 'Salted__'; then
  echo "ERROR: ${ENC} is not an openssl encrypted file. First bytes: $(head -c 32 "$ENC" | tr -cd '[:print:]')" >&2
  exit 1
fi

if [[ "${CONFIRM}" == "VERIFY" && -s "$WORK/ops/secrets/env.enc" ]]; then
  TMP_ENV="$(mktemp)"
  meti_decrypt_file "$WORK/ops/secrets/env.enc" "$TMP_ENV" "${BACKUP_ENCRYPTION_KEY:?}"
  if ! grep -qE '^DATABASE_URL=' "$TMP_ENV" || ! grep -qE '^BACKUP_ENCRYPTION_KEY=' "$TMP_ENV"; then
    rm -f "$TMP_ENV"
    echo "ERROR: secrets/env.enc decrypted but is missing expected keys" >&2
    exit 1
  fi
  rm -f "$TMP_ENV"
  echo "secrets/env.enc decrypts and contains expected keys (values not printed)"
fi

CONFIRM="${CONFIRM}" "${ROOT}/deploy/restore-studio-data.sh" "$ENC"
if [[ "${CONFIRM}" == "VERIFY" ]]; then
  echo "Verified ${DAY} from ${OPS_REPO} without replacing the live database"
else
  echo "Restored ${DAY} from ${OPS_REPO}"
fi
