"""Run after `alembic upgrade head` to import legacy SQLite data."""
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import AsyncSessionLocal
from app.models.location import Location


async def seed() -> None:
    seed_file = Path(__file__).parent.parent / "seed_data.json"
    if not seed_file.exists():
        print("seed_data.json not found, skipping")
        return

    data = json.loads(seed_file.read_text(encoding="utf-8"))
    async with AsyncSessionLocal() as db:
        for row in data:
            if not row.get("id"):
                print(f"Skipping row with empty id: {row}")
                continue
            existing = await db.get(Location, row["id"])
            if existing:
                print(f"Location '{row['id']}' already exists, skipping")
                continue
            loc = Location(
                id=row["id"],
                name=row.get("name", ""),
                corpus=row["corpus"],
                floor=row["floor"],
                coordinates=row["coordinates"],
                indoor_position=row.get("indoorPosition", {"x": 50, "y": 50}),
                overview_position=row.get("overviewPosition"),
                panorama=row.get("panorama", ""),
                description=row.get("description", ""),
                markers=row.get("markers", []),
            )
            db.add(loc)
        await db.commit()
    print(f"Seeded {len(data)} location(s)")


asyncio.run(seed())
