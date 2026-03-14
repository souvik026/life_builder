from datetime import date
from database import DatabaseClient


class LogRepository:
    def __init__(self, db: DatabaseClient):
        self.db = db

    async def upsert(self, habit_id: str, completed: bool, note: str = "") -> None:
        await self.db.execute(
            """INSERT INTO habit_logs (habit_id, log_date, completed, note)
               VALUES ($1, CURRENT_DATE, $2, $3)
               ON CONFLICT (habit_id, log_date)
               DO UPDATE SET completed = $2, note = $3""",
            habit_id, completed, note,
        )

    async def get_completed_today(self, habit_id: str) -> bool:
        val = await self.db.fetchval(
            "SELECT completed FROM habit_logs WHERE habit_id = $1 AND log_date = CURRENT_DATE",
            habit_id,
        )
        return val is True

    async def get_total_completed_count(self) -> int:
        val = await self.db.fetchval(
            "SELECT COUNT(*) FROM habit_logs WHERE completed = true"
        )
        return val or 0

    async def get_daily_completion_rates(self) -> list[dict]:
        rows = await self.db.fetch(
            """SELECT log_date,
                      COUNT(*) FILTER (WHERE completed) as done,
                      COUNT(*) as total
               FROM habit_logs
               GROUP BY log_date
               ORDER BY log_date"""
        )
        return [
            {"date": str(r["log_date"]), "pct": round(r["done"] / r["total"] * 100) if r["total"] > 0 else 0}
            for r in rows
        ]

    async def get_completed_dates(self, habit_id: str) -> list[date]:
        rows = await self.db.fetch(
            "SELECT log_date FROM habit_logs WHERE habit_id = $1 AND completed = true ORDER BY log_date DESC",
            habit_id,
        )
        return [r["log_date"] for r in rows]
