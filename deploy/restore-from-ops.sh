#!/usr/bin/env bash
# Pull an encrypted backup from the private ops repo and restore this VPS.
#   CONFIRM=RESTORE ./deploy/restore-from-ops.sh [latest|YYYY-MM-DD]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DAY="${1:-latest}"

if [[ "${CONFIRM:-}" != "RESTORE" ]]; then
  echo "Refusing to restore. Re-run with CONFIRM=RESTORE" >&2
  exit 1
fi

# shellcheck disable=SC1091
[[ -f .env ]] && set -a && source .env && set +a

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

CONFIRM=RESTORE "${ROOT}/deploy/restore-studio-data.sh" "$ENC"
echo "Restored ${DAY} from ${OPS_REPO}"
