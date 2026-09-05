# MeTi studio ops (private)

Encrypted production backups and restore notes for the live studio site.

This repository is **private**. Files here still stay encrypted so a leaked
GitHub token is not enough to read customer bookings.

## Runbooks

| Doc | Contents |
|-----|----------|
| [docs/OPS.md](docs/OPS.md) | Setup, restore, rebuild, alerts |
| [docs/BACKUP.md](docs/BACKUP.md) | Nightly backup path |
| [docs/GITHUB-SECRETS.md](docs/GITHUB-SECRETS.md) | GitHub secrets and host facts |
| [docs/RECOVERY.md](docs/RECOVERY.md) | Disaster recovery |

## What is stored

| Path | Contents |
|------|----------|
| `backups/YYYY-MM-DD.db.enc` | Encrypted SQLite (schedule, closures, customers) |
| `backups/latest.db.enc` | Newest database copy |
| `secrets/env.enc` | Encrypted production `.env` |
| `inventory.md` | Host, paths, and service names — no passwords |
| `env.example` | Required variable names only |
| `docs/` | Operational runbooks (not in the public product repo) |

The decrypt key is `BACKUP_ENCRYPTION_KEY`. Keep it in a password manager
**and** as a GitHub Actions secret. It is not written here in plaintext.

Never commit a decrypted `.env` or `.db` file to any git repo.
