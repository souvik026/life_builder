from database import DatabaseClient


class StreakRepository:
    def __init__(self, db: DatabaseClient):
        self.db = db

    async def get_by_habit(self, habit_id: str) -> int:
        val = await self.db.fetchval(
            "SELECT current_streak FROM streaks WHERE habit_id = $1",
            habit_id,
        )
        return val or 0

    async def upsert(self, habit_id: str, current_streak: int, longest_streak: int, last_completed) -> None:
        await self.db.execute(
            """INSERT INTO streaks (habit_id, current_streak, longest_streak, last_completed, updated_at)
               VALUES ($1, $2, $3, $4, now())
               ON CONFLICT (habit_id)
               DO UPDATE SET current_streak = $2, longest_streak = $3, last_completed = $4, updated_at = now()""",
            habit_id, current_streak, longest_streak, last_completed,
        )
