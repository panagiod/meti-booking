# GitHub Actions secrets (host-specific)

CI/CD **cannot connect** until these secrets exist on `panagiod/meti-booking`.
The cloud agent cannot add them (GitHub security).

## Deploy (required)

On the server:

```bash
ssh root@2.29.22.46
cd ~/meti-booking
git pull
./deploy/setup-cicd.sh
```

Copy the output (host, user, private key).

Open: **https://github.com/panagiod/meti-booking/settings/secrets/actions**

| Secret | Value |
|--------|--------|
| `PRODUCTION_HOST` | `2.29.22.46` |
| `PRODUCTION_USER` | `root` |
| `PRODUCTION_SSH_KEY` | Full private key from setup script (`-----BEGIN…` through `-----END…`) |

The saved `PRODUCTION_SSH_KEY` has been incomplete (about 513 characters). If
SSH from Actions fails, re-run `setup-cicd.sh` and paste the **entire** key.

Then push to `main` or run **Actions → Deploy Production**.

## Backups and rebuild (required)

| Secret | Value |
|--------|--------|
| `OPS_REPO` | `panagiod/meti-studio-ops` |
| `OPS_REPO_TOKEN` | Fine-grained PAT, Contents read/write on this private repo only |
| `BACKUP_ENCRYPTION_KEY` | From the server `.env` — also keep in a password manager |

## Rebuild on a new VPS

| Secret | Value |
|--------|--------|
| `RECOVERY_HOST` | New IPv4 |
| `RECOVERY_USER` | `root` |
| `RECOVERY_SSH_KEY` | Unrestricted private key for the new machine |

## Optional (uptime email from GitHub)

| Secret | Value |
|--------|--------|
| `RESEND_API_KEY` | Same key as server `.env` (Actions cannot read the server file) |
| `EMAIL_FROM` | e.g. `MeTi Pilates <bookings@meti-pilates.com>` |
| `STUDIO_NOTIFICATION_EMAIL` | Studio inbox (comma-separated if several) |

## How to generate app secrets (on the server, not in the public repo)

```bash
openssl rand -base64 32   # BETTER_AUTH_SECRET, ENCRYPTION_KEY, BACKUP_ENCRYPTION_KEY
openssl rand -hex 24      # CRON_SECRET
openssl rand -hex 32      # ADMIN_PROMOTE_TOKEN
```

Never commit these values. Never write the host IP or this ops repo name into
the public `meti-booking` markdown.
