from database import DatabaseClient
from models.habit import Habit


class HabitRepository:
    def __init__(self, db: DatabaseClient):
        self.db = db

    async def get_all(self, category: str | None = None) -> list[Habit]:
        if category:
            rows = await self.db.fetch(
                "SELECT * FROM habits WHERE category = $1 AND is_active = true ORDER BY sort_order",
                category,
            )
        else:
            rows = await self.db.fetch(
                "SELECT * FROM habits WHERE is_active = true ORDER BY sort_order"
            )
        return [Habit(id=str(r["id"]), **{k: r[k] for k in r.keys() if k != "id"}) for r in rows]

    async def get_by_id(self, habit_id: str) -> Habit | None:
        row = await self.db.fetchrow("SELECT * FROM habits WHERE id = $1", habit_id)
        if not row:
            return None
        return Habit(id=str(row["id"]), **{k: row[k] for k in row.keys() if k != "id"})

    async def create(self, name: str, category: str, description: str = "", sort_order: int = 0) -> Habit:
        row = await self.db.fetchrow(
            """INSERT INTO habits (name, category, description, sort_order)
               VALUES ($1, $2, $3, $4) RETURNING *""",
            name, category, description, sort_order,
        )
        return Habit(id=str(row["id"]), **{k: row[k] for k in row.keys() if k != "id"})
