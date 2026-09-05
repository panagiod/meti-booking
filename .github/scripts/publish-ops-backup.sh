#!/usr/bin/env bash
# Publish encrypted backup files into the private ops repo.
# Required env: OPS_REPO, OPS_REPO_TOKEN, DAY, FINGERPRINT
# Files: $RUNNER_TEMP/backup.db.enc
# Optional: $RUNNER_TEMP/backup.env.enc, $RUNNER_TEMP/backup.inventory
set -euo pipefail

if [[ -z "${OPS_REPO:-}" || -z "${OPS_REPO_TOKEN:-}" ]]; then
  echo "ERROR: OPS_REPO and OPS_REPO_TOKEN are required" >&2
  exit 1
fi

DAY="${DAY:?}"
FINGERPRINT="${FINGERPRINT:-unknown}"
SRC_DB="${BACKUP_ENC_FILE:-${RUNNER_TEMP}/backup.db.enc}"
SRC_ENV="${ENV_ENC_FILE:-${RUNNER_TEMP}/backup.env.enc}"
SRC_INV="${INVENTORY_FILE:-${RUNNER_TEMP}/backup.inventory}"
TEMPLATE_ROOT="${GITHUB_WORKSPACE:-.}"

if [[ ! -s "$SRC_DB" ]]; then
  echo "ERROR: missing encrypted database ${SRC_DB}" >&2
  exit 1
fi

BYTES="$(wc -c <"$SRC_DB" | tr -d ' ')"
if [[ "${BYTES:-0}" -lt 64 ]]; then
  echo "ERROR: backup file is too small (${BYTES} bytes)" >&2
  exit 1
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

git clone --depth 1 "https://x-access-token:${OPS_REPO_TOKEN}@github.com/${OPS_REPO}.git" "$WORK/ops"
cd "$WORK/ops"

git config user.name meti-backup
git config user.email 41898282+github-actions[bot]@users.noreply.github.com

mkdir -p backups secrets
cp "$SRC_DB" "backups/${DAY}.db.enc"
cp "$SRC_DB" backups/latest.db.enc

if [[ -s "$SRC_ENV" ]]; then
  cp "$SRC_ENV" secrets/env.enc
fi

if [[ -s "$SRC_INV" ]]; then
  {
    echo "# Studio inventory"
    echo
    echo "Generated ${DAY}. Values are host facts, not passwords."
    echo
    echo '```'
    cat "$SRC_INV"
    echo '```'
  } > inventory.md
fi

if [[ -d "${TEMPLATE_ROOT}/deploy/ops-repo" ]]; then
  cp "${TEMPLATE_ROOT}/deploy/ops-repo/README.md" README.md
  cp "${TEMPLATE_ROOT}/deploy/ops-repo/env.example" env.example
fi

python3 - <<PY
from datetime import date, timedelta
from pathlib import Path
keep_after = date.today() - timedelta(days=90)
for path in Path("backups").glob("*.db.enc"):
    if path.name == "latest.db.enc":
        continue
    try:
        day = date.fromisoformat(path.stem)
    except ValueError:
        continue
    if day >= keep_after or day.day == 1:
        continue
    path.unlink()
PY

git add backups secrets inventory.md README.md env.example
if git diff --staged --quiet; then
  echo "No ops-repo changes"
  exit 0
fi

git commit -m "backup: ${DAY} studio database (key ${FINGERPRINT:0:12})"
git push origin HEAD
echo "Published encrypted backup ${DAY} to ${OPS_REPO}"
