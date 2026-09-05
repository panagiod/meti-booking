# MeTi studio ops (private)

Encrypted production backups and restore notes for [meti-pilates.com](https://meti-pilates.com).

This repository is **private**. Files here still stay encrypted so a leaked GitHub token is not enough to read customer bookings.

## What is stored

| Path | Contents |
|------|----------|
| `backups/YYYY-MM-DD.db.enc` | Encrypted SQLite (schedule, closures, customers) |
| `backups/latest.db.enc` | Newest database copy |
| `secrets/env.enc` | Encrypted production `.env` |
| `inventory.md` | Host, paths, and service names — no passwords |
| `env.example` | Required variable names only |

The decrypt key is `BACKUP_ENCRYPTION_KEY`. Keep it in a password manager **and** as a GitHub Actions secret. It is not written here in plaintext.

## Restore on the live server

In the public repo: **Actions → Restore Production → Run workflow**

- **Target:** `current`
- **Backup:** `latest` or `YYYY-MM-DD`
- **Confirm:** `RESTORE`

That uses the existing deploy SSH key and the key already on the server.

## Rebuild if the VPS is gone

1. Create a new Ubuntu VPS (Hetzner CX23 is enough).
2. Add an unrestricted SSH public key for GitHub Actions on that machine.
3. In `panagiod/meti-booking` secrets, set:
   - `RECOVERY_HOST` — new IPv4
   - `RECOVERY_USER` — `root`
   - `RECOVERY_SSH_KEY` — matching private key
   - `BACKUP_ENCRYPTION_KEY` — same key used to encrypt these files
   - `OPS_REPO` / `OPS_REPO_TOKEN` — so the Action can read this repo
4. **Actions → Rebuild Production → Run workflow**
5. Point the `meti-pilates.com` DNS A record at the new IP.
6. Re-run `./deploy/setup-cicd.sh` on the new server and update `PRODUCTION_HOST` / `PRODUCTION_SSH_KEY`.

Manual rebuild from the new server:

```bash
export OPS_REPO=panagiod/meti-studio-ops
export OPS_REPO_TOKEN=...          # fine-grained PAT, contents read
export BACKUP_ENCRYPTION_KEY=...
CONFIRM=REBUILD ./deploy/bootstrap-from-ops.sh latest
```

## Manual database restore

```bash
cd ~/meti-booking
CONFIRM=RESTORE ./deploy/restore-studio-data.sh /path/to/latest.db.enc
```

Never commit a decrypted `.env` or `.db` file to any git repo.
