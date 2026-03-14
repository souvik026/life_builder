from database import DatabaseClient
from models.timed_task import TimedTask


class TaskRepository:
    def __init__(self, db: DatabaseClient):
        self.db = db

    async def get_all_active(self) -> list[TimedTask]:
        rows = await self.db.fetch(
            "SELECT * FROM timed_tasks WHERE is_active = true ORDER BY added_at"
        )
        return [
            TimedTask(
                id=str(r["id"]),
                name=r["name"],
                target_days=r["target_days"],
                target_minutes=r["target_minutes"],
                start_date=str(r["start_date"]) if r["start_date"] else None,
                is_active=r["is_active"],
                added_at=r["added_at"],
            )
            for r in rows
        ]

    async def create(self, name: str, target_minutes: int = 60) -> TimedTask:
        row = await self.db.fetchrow(
            """INSERT INTO timed_tasks (name, target_minutes)
               VALUES ($1, $2) RETURNING *""",
            name, target_minutes,
        )
        return TimedTask(
            id=str(row["id"]),
            name=row["name"],
            target_days=row["target_days"],
            target_minutes=row["target_minutes"],
            start_date=str(row["start_date"]) if row["start_date"] else None,
            is_active=row["is_active"],
            added_at=row["added_at"],
        )

    async def log_session(self, task_id: str, minutes_done: int, note: str = "") -> None:
        await self.db.execute(
            """INSERT INTO task_sessions (task_id, session_date, minutes_done, note)
               VALUES ($1, CURRENT_DATE, $2, $3)""",
            task_id, minutes_done, note,
        )

    async def get_minutes_today(self, task_id: str) -> int:
        val = await self.db.fetchval(
            "SELECT COALESCE(SUM(minutes_done), 0) FROM task_sessions WHERE task_id = $1 AND session_date = CURRENT_DATE",
            task_id,
        )
        return val or 0

    async def get_total_minutes_by_task(self) -> list[dict]:
        rows = await self.db.fetch(
            """SELECT t.name, COALESCE(SUM(s.minutes_done), 0) as total
               FROM timed_tasks t
               LEFT JOIN task_sessions s ON t.id = s.task_id
               WHERE t.is_active = true
               GROUP BY t.id, t.name
               ORDER BY total DESC"""
        )
        return [{"name": r["name"], "total_minutes": int(r["total"])} for r in rows]

    async def get_streak_days(self, task_id: str) -> int:
        """Count consecutive days with at least one session, ending today."""
        rows = await self.db.fetch(
            """SELECT DISTINCT session_date FROM task_sessions
               WHERE task_id = $1 ORDER BY session_date DESC""",
            task_id,
        )
        if not rows:
            return 0
        from datetime import date, timedelta
        streak = 0
        expected = date.today()
        for r in rows:
            if r["session_date"] == expected:
                streak += 1
                expected -= timedelta(days=1)
            else:
                break
        return streak
