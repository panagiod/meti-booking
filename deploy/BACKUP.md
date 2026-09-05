# Studio backups

The live schedule, closures, and customer bookings sit in one SQLite file on
the VPS. Encrypted copies go to a **private** ops repository (`OPS_REPO`).

Host-specific restore steps are **not** in this public file. See the private
repo `docs/BACKUP.md` and `docs/OPS.md`.

## What you can do from this repo

- **Actions → Backup Production** — write an encrypted copy now
- **Actions → Verify Restore** — decrypt and check (does not replace live data)
- **Actions → Restore Production** — type `RESTORE` to replace live `data.db`
- **Actions → Rebuild Production** — type `REBUILD` on a new VPS

If you change backup or restore scripts, update the **private** runbooks in
the same change. Do not put the production host or the ops repo name back
into this public file.
