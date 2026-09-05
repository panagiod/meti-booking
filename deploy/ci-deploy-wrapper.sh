#!/usr/bin/env bash
# SSH forced-command entrypoint for GitHub Actions deploy key.
# Only this script may run when CI connects — see deploy/setup-cicd.sh
set -euo pipefail

REPO="${METI_REPO_DIR:-$HOME/meti-booking}"

if [[ ! -d "$REPO/.git" ]]; then
  echo "ERROR: Repository not found at $REPO" >&2
  exit 1
fi

cd "$REPO"

# Backup / restore jobs must not deploy. `ssh host METI_BACKUP` sets SSH_ORIGINAL_COMMAND.
if [[ "${SSH_ORIGINAL_COMMAND:-}" == "METI_BACKUP" ]]; then
  exec "$REPO/deploy/backup-studio-data.sh" --stdout
fi

if [[ "${SSH_ORIGINAL_COMMAND:-}" == "METI_RESTORE" ]]; then
  tmp="$(mktemp)"
  cleanup_restore() { rm -f "$tmp"; }
  trap cleanup_restore EXIT
  base64 -d >"$tmp"
  if [[ ! -s "$tmp" ]]; then
    echo "ERROR: empty restore payload" >&2
    exit 1
  fi
  CONFIRM=RESTORE "$REPO/deploy/restore-studio-data.sh" "$tmp"
  exit 0
fi

git fetch origin main
git reset --hard origin/main
exec "$REPO/deploy/remote-deploy.sh"
