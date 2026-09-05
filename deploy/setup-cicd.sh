#!/usr/bin/env bash
# One-time CI/CD setup on the production VPS.
# Creates a deploy SSH key for GitHub Actions and prints secrets to add on GitHub.
#
# Run on the server (as root or deploy user):
#   cd ~/meti-booking && git pull && ./deploy/setup-cicd.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

KEY="${HOME}/.ssh/github_actions_meti_deploy"
AUTH="${HOME}/.ssh/authorized_keys"
WRAPPER="${ROOT}/deploy/ci-deploy-wrapper.sh"
MARKER="github-actions-meti-booking"

chmod +x "$ROOT/deploy/ci-deploy-wrapper.sh" "$ROOT/deploy/remote-deploy.sh"

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"

if [[ ! -f "$KEY" ]]; then
  echo "==> Generating deploy SSH key..."
  ssh-keygen -t ed25519 -f "$KEY" -N "" -C "$MARKER"
fi

chmod 600 "$KEY"
chmod 644 "${KEY}.pub"

# Restrict key: only run deploy wrapper, no shell access
RESTRICTED="command=\"${WRAPPER}\",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty $(cat "${KEY}.pub")"

touch "$AUTH"
chmod 600 "$AUTH"
if ! grep -qF "$MARKER" "$AUTH"; then
  echo "$RESTRICTED" >> "$AUTH"
  echo "==> Added restricted deploy key to $AUTH"
else
  echo "==> Deploy key already in $AUTH"
fi

PUBLIC_IP="$(curl -fsS --max-time 5 https://api4.ipify.org 2>/dev/null || curl -fsS --max-time 5 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"

echo ""
echo "=============================================="
echo " GitHub repository secrets (one-time setup)"
echo " Repo: https://github.com/panagiod/meti-booking/settings/secrets/actions"
echo "=============================================="
echo ""
echo "PRODUCTION_HOST"
echo "$PUBLIC_IP"
echo ""
echo "PRODUCTION_USER"
echo "$(whoami)"
echo ""
echo "PRODUCTION_SSH_KEY"
echo "(copy everything below, including BEGIN/END lines)"
echo "----------------------------------------------"
cat "$KEY"
echo "----------------------------------------------"
echo ""
if [[ -f "$ROOT/.env" ]] && grep -q '^BACKUP_ENCRYPTION_KEY=' "$ROOT/.env"; then
  echo "BACKUP_ENCRYPTION_KEY"
  echo "(keep this in a password manager — needed to restore backups if the server is lost)"
  echo "----------------------------------------------"
  grep '^BACKUP_ENCRYPTION_KEY=' "$ROOT/.env" | cut -d= -f2-
  echo "----------------------------------------------"
  echo ""
fi

echo "Also add these so backups stay in the private ops repo (see deploy/OPS.md):"
echo "  OPS_REPO=panagiod/meti-studio-ops"
echo "  OPS_REPO_TOKEN=<fine-grained PAT with Contents write on that private repo>"
echo ""
echo "After adding secrets, push to main or run:"
echo "  GitHub → Actions → Deploy Production → Run workflow"
echo ""
echo "Daily encrypted backups are saved to the private meti-studio-ops repo."
echo "Deploy logs on this server: /var/log/meti-booking/deploy.log"
