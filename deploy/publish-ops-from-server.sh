#!/usr/bin/env bash
# Push the latest local encrypted backup into the private ops repo.
# Requires OPS_REPO_TOKEN in the server .env
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
[[ -f .env ]] && set -a && source .env && set +a

OPS_REPO="${OPS_REPO:-panagiod/meti-studio-ops}"
DATA_DIR="${METI_DATA_DIR:-/var/lib/meti-booking}"
DB_ENC="${DATA_DIR}/backups/latest.db.enc"
ENV_ENC="${DATA_DIR}/backups/latest.env.enc"
DAY="$(date -u +%Y-%m-%d)"

if [[ -z "${OPS_REPO_TOKEN:-}" ]]; then
  echo "ERROR: OPS_REPO_TOKEN is missing from .env" >&2
  echo "On the server, add the same GitHub token used for the OPS_REPO_TOKEN secret:" >&2
  echo "  printf '\\nOPS_REPO=panagiod/meti-studio-ops\\nOPS_REPO_TOKEN=YOUR_PAT\\n' >> ~/meti-booking/.env" >&2
  exit 1
fi

if [[ ! -s "$DB_ENC" ]]; then
  echo "ERROR: missing ${DB_ENC} — run deploy/backup-studio-data.sh first" >&2
  exit 1
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

export DAY FINGERPRINT="${BACKUP_ENCRYPTION_KEY:+$(printf '%s' "$BACKUP_ENCRYPTION_KEY" | openssl dgst -sha256 -r | awk '{print $1}')}"
export OPS_REPO OPS_REPO_TOKEN
export BACKUP_ENC_FILE="$DB_ENC"
export ENV_ENC_FILE="$ENV_ENC"
export INVENTORY_FILE="$WORK/inventory"
export RUNNER_TEMP="$WORK"
export GITHUB_WORKSPACE="$ROOT"

"${ROOT}/deploy/write-ops-inventory.sh" >"$INVENTORY_FILE" || true
chmod +x "${ROOT}/.github/scripts/publish-ops-backup.sh"
"${ROOT}/.github/scripts/publish-ops-backup.sh"
echo "METI_OPS_PUBLISHED=1"
