from datetime import date, timedelta
from pathlib import Path

keep_after = date.today() - timedelta(days=90)
for path in Path("backups").glob("*.db.enc"):
    if path.name == "latest.db.enc":
        continue
    try:
        day = date.fromisoformat(path.stem)
    except ValueError:
        continue
    if day >= keep_after or day.day == 1:
        continue
    path.unlink()
