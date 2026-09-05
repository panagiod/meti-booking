#!/usr/bin/env bash
# Rebuild this machine from the private ops repo (new VPS or empty disk).
# Installs the app first, then restores the encrypted database last so
# `prisma db push` cannot rewrite live customer data.
#
#   export OPS_REPO=panagiod/meti-studio-ops
#   export OPS_REPO_TOKEN=...
#   export BACKUP_ENCRYPTION_KEY=...
#   CONFIRM=REBUILD ./deploy/bootstrap-from-ops.sh [latest|YYYY-MM-DD]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DAY="${1:-latest}"
OPS_REPO="${OPS_REPO:-panagiod/meti-studio-ops}"

if [[ "${CONFIRM:-}" != "REBUILD" ]]; then
  echo "Refusing to rebuild. Re-run with CONFIRM=REBUILD" >&2
  exit 1
fi

if [[ -z "${OPS_REPO_TOKEN:-}" ]]; then
  echo "ERROR: OPS_REPO_TOKEN is missing" >&2
  exit 1
fi

if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
  echo "ERROR: BACKUP_ENCRYPTION_KEY is missing" >&2
  exit 1
fi

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: CONFIRM=REBUILD $0 ${DAY}" >&2
  exit 1
fi

# shellcheck disable=SC1091
source "${ROOT}/deploy/backup-crypto.sh"

WORK="$(mktemp -d)"
cleanup() {
  rm -rf "$WORK"
}
trap cleanup EXIT

AUTH="https://x-access-token:${OPS_REPO_TOKEN}@github.com/${OPS_REPO}.git"
git clone --depth 1 "$AUTH" "$WORK/ops" >/dev/null

if [[ "$DAY" == "latest" ]]; then
  DB_ENC="$WORK/ops/backups/latest.db.enc"
else
  DB_ENC="$WORK/ops/backups/${DAY}.db.enc"
fi
ENV_ENC="$WORK/ops/secrets/env.enc"

if [[ ! -f "$DB_ENC" ]]; then
  echo "ERROR: backup not found in ${OPS_REPO}: backups/${DAY}.db.enc" >&2
  exit 1
fi

if [[ ! -f "$ENV_ENC" ]]; then
  echo "ERROR: secrets/env.enc is missing — cannot rebuild .env" >&2
  exit 1
fi

echo "==> Restoring production .env"
meti_decrypt_file "$ENV_ENC" "${ROOT}/.env" "$BACKUP_ENCRYPTION_KEY"
chmod 600 "${ROOT}/.env"
if ! grep -q '^BACKUP_ENCRYPTION_KEY=' "${ROOT}/.env"; then
  printf '\nBACKUP_ENCRYPTION_KEY=%s\n' "$BACKUP_ENCRYPTION_KEY" >>"${ROOT}/.env"
fi

echo "==> Installing packages and deploying an empty app"
if ! command -v node >/dev/null 2>&1 || ! command -v caddy >/dev/null 2>&1; then
  "${ROOT}/deploy/install-lite.sh"
fi
"${ROOT}/deploy/remote-deploy.sh"

echo "==> Restoring studio database from ${DAY}"
CONFIRM=RESTORE "${ROOT}/deploy/restore-studio-data.sh" "$DB_ENC"

echo "Rebuild complete. Point DNS at this server if the IP changed."
echo "Then run ./deploy/setup-cicd.sh and update PRODUCTION_HOST on GitHub."
