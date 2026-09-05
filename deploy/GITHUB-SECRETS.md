# GitHub Actions secrets

This public file lists secret **names** only. Host addresses, key material,
and the private ops repo path live in that private repo’s
`docs/GITHUB-SECRETS.md`.

## Deploy

| Secret | What it is |
|--------|------------|
| `PRODUCTION_HOST` | Server address (from `./deploy/setup-cicd.sh` on the VPS) |
| `PRODUCTION_USER` | SSH user printed by the setup script |
| `PRODUCTION_SSH_KEY` | Full private key printed by the setup script |

On the server: `cd ~/meti-booking && ./deploy/setup-cicd.sh`, then paste the
output into this repo’s Actions secrets. Do not write the address here.

## Backups and rebuild

| Secret | What it is |
|--------|------------|
| `OPS_REPO` | `owner/name` of the private ops repository |
| `OPS_REPO_TOKEN` | Fine-grained PAT with Contents access on that repo only |
| `BACKUP_ENCRYPTION_KEY` | From the server `.env` (also keep in a password manager) |
| `RECOVERY_HOST` | New VPS address, only when rebuilding |
| `RECOVERY_USER` | SSH user for the new VPS |
| `RECOVERY_SSH_KEY` | Unrestricted private key for the new VPS |

## Optional (uptime email from GitHub)

| Secret | What it is |
|--------|------------|
| `RESEND_API_KEY` | Actions cannot read the server `.env` |
| `EMAIL_FROM` | From-address for downtime mail |
| `STUDIO_NOTIFICATION_EMAIL` | Studio inbox |

After the three deploy secrets exist, push to `main` or run
**Actions → Deploy Production**.
