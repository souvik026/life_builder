"""
Seed habits from habits.md into the database.

Usage:
    docker-compose exec backend python seed/seed_habits.py
"""

import asyncio
import sys
import os

# Add parent dir to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Settings
from database import DatabaseClient


class HabitSeeder:
    def __init__(self, db: DatabaseClient):
        self.db = db

    def parse_habits(self, markdown: str) -> list[dict]:
        habits = []
        category = "morning"
        order = 0
        for line in markdown.split("\n"):
            lower = line.lower().strip()
            if "morning" in lower and line.strip().startswith("##"):
                category = "morning"
                continue
            if "life" in lower and line.strip().startswith("##"):
                category = "life"
                continue
            stripped = line.strip()
            if stripped.startswith("-") and len(stripped) > 2:
                name = stripped.lstrip("- ").strip()
                if name:
                    habits.append({
                        "name": name,
                        "category": category,
                        "sort_order": order,
                    })
                    order += 1
        return habits

    async def seed(self) -> None:
        # Read habits.md
        md_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "habits.md")
        with open(md_path) as f:
            markdown = f.read()

        habits = self.parse_habits(markdown)

        # Check if habits already exist
        count = await self.db.fetchval("SELECT COUNT(*) FROM habits")
        if count > 0:
            print(f"Habits table already has {count} rows. Skipping seed.")
            return

        for h in habits:
            await self.db.execute(
                "INSERT INTO habits (name, category, sort_order) VALUES ($1, $2, $3)",
                h["name"], h["category"], h["sort_order"],
            )
            print(f"  + [{h['category']}] {h['name']}")

        print(f"\nSeeded {len(habits)} habits.")


async def main():
    settings = Settings()
    db = DatabaseClient(settings)
    await db.connect()
    try:
        seeder = HabitSeeder(db)
        await seeder.seed()
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
