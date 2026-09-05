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

# Backup jobs must not deploy. `ssh host METI_BACKUP` sets SSH_ORIGINAL_COMMAND.
if [[ "${SSH_ORIGINAL_COMMAND:-}" == "METI_BACKUP" ]]; then
  exec "$REPO/deploy/backup-studio-data.sh" --stdout
fi

git fetch origin main
git reset --hard origin/main
exec "$REPO/deploy/remote-deploy.sh"
