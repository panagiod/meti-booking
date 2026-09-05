---
name: meti-backup-restore
description: MeTi Pilates production backup, verify, restore, and rebuild. Use when changing backup or restore scripts, ops repo publish, disaster recovery, or GitHub Actions for Backup / Verify Restore / Restore / Rebuild.
---

# MeTi backup and restore

Host-specific runbooks live in the **private** ops repository (`docs/OPS.md`,
`docs/BACKUP.md`, `docs/RECOVERY.md`). Public pointer:
**[deploy/OPS.md](../../../deploy/OPS.md)**.

Agent recap: **[AGENTS.md](../../../AGENTS.md)** → Disaster recovery.

## Rule

If a change affects backup or restore, update the **private** runbooks. Do not
write the production host, SSH commands with a live address, or the private
ops repo name into this public repository.

Update all of:

- Private ops repo `docs/OPS.md`, `docs/BACKUP.md`, `docs/RECOVERY.md`
- [deploy/OPS.md](../../../deploy/OPS.md) (public pointer only)
- [AGENTS.md](../../../AGENTS.md) Disaster recovery (Actions names only)
- this skill, if the Action names or file list changed

That includes edits to:

- `deploy/backup-studio-data.sh`, `deploy/publish-ops-from-server.sh`, `deploy/backup-crypto.sh`
- `deploy/restore-from-ops.sh`, `deploy/restore-studio-data.sh`, `deploy/bootstrap-from-ops.sh`
- `deploy/ci-deploy-wrapper.sh`, `deploy/ensure-backup-key.sh`
- `.github/workflows/backup-production.yml`, `verify-restore.yml`, `restore-production.yml`, `rebuild-production.yml`, `backup-and-restore.yml`
- `.github/scripts/publish-ops-backup.sh`

Do not invent a second restore path. Do not `--force-reset` or cancel upcoming bookings. Do not commit plaintext `.env` or `data.db`.

## Current procedures (public-safe)

**Backup:** VPS encrypts SQLite + `.env`, then publishes to the private ops repo. Actions → **Backup Production**, nightly cron, and post-deploy.

**Verify (no live swap):** Actions → **Verify Restore** (`latest`). Decrypts and checks tables. Site stays up.

**Same VPS restore:** Actions → **Restore Production** → `latest` + type `RESTORE`.

**Dress rehearsal:** Actions → **Backup and Restore** → type `RESTORE`.

**New VPS:** Actions → **Rebuild Production** → `REBUILD`. Needs `BACKUP_ENCRYPTION_KEY` plus an unrestricted recovery SSH key.

**Refresh private runbooks:** edit `docs/` in the private ops repo. Do not copy host facts back into this public tree.
