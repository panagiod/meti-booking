# Studio backups

MeTi Pilates stores the schedule, blocked dates, and customer bookings in one
SQLite file:

`/var/lib/meti-booking/data.db`

The public repo must not keep those files in plaintext. Encrypted copies go
here, in `panagiod/meti-studio-ops`.

If you change backup or restore, update this file, [OPS.md](./OPS.md),
[RECOVERY.md](./RECOVERY.md), and the public agent skill
`.agents/skills/meti-backup-restore/SKILL.md` (public-safe summary only) in the
same change. Then run **Actions → Publish Ops Docs** if the public template
still has a `deploy/ops-repo/docs/` payload; otherwise edit this private repo
directly.

## What runs automatically

1. **On the VPS, every night at 02:00 UTC** (05:00 Nicosia in summer)
   `deploy/backup-studio-data.sh` writes:
   - encrypted files in `/var/lib/meti-booking/backups/`
   - last 7 raw copies on the server only
2. **GitHub Actions, every night and after each deploy**
   Pulls the encrypted database and `.env` over the restricted deploy SSH key
   and commits them to `panagiod/meti-studio-ops`.

Because the saved `PRODUCTION_SSH_KEY` may be an incomplete private key,
backups currently run **on the server** and push out with `OPS_REPO_TOKEN`.

## Restore the live database (same VPS)

GitHub → **Actions → Restore Production** → backup `latest` → confirm `RESTORE`

Or on the server:

```bash
ssh root@2.29.22.46
cd ~/meti-booking
CONFIRM=RESTORE ./deploy/restore-from-ops.sh latest
```

The restore script decrypts with `BACKUP_ENCRYPTION_KEY`, saves the current
database first, then replaces `data.db`.

## If the server is gone

Use **Actions → Rebuild Production** on a new VPS, or run
`CONFIRM=REBUILD ./deploy/bootstrap-from-ops.sh latest`. Full steps are in
[OPS.md](./OPS.md) and [RECOVERY.md](./RECOVERY.md).

Store `BACKUP_ENCRYPTION_KEY` in a password manager and as the GitHub secret
of the same name.

## Manual backup

```bash
ssh root@2.29.22.46
cd ~/meti-booking
./deploy/backup-studio-data.sh
```

Or run **Actions → Backup Production → Run workflow**.
