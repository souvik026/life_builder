from database import DatabaseClient
from models.goal import Goal, GoalLog


class GoalRepository:
    def __init__(self, db: DatabaseClient):
        self.db = db

    async def get_all(self, status: str | None = None) -> list[Goal]:
        if status:
            rows = await self.db.fetch(
                "SELECT * FROM goals WHERE status = $1 ORDER BY created_at DESC",
                status,
            )
        else:
            rows = await self.db.fetch(
                "SELECT * FROM goals ORDER BY created_at DESC"
            )
        return [self._row_to_goal(r) for r in rows]

    async def get_by_id(self, goal_id: str) -> Goal | None:
        row = await self.db.fetchrow(
            "SELECT * FROM goals WHERE id = $1", goal_id
        )
        if not row:
            return None
        return self._row_to_goal(row)

    async def create(
        self,
        category: str,
        title: str,
        description: str = "",
        target_value: float | None = None,
        unit: str = "",
        target_date: str | None = None,
        source: str = "manual",
    ) -> Goal:
        row = await self.db.fetchrow(
            """INSERT INTO goals (category, title, description, target_value, unit, target_date, source)
               VALUES ($1, $2, $3, $4, $5, $6::date, $7)
               RETURNING *""",
            category, title, description, target_value, unit, target_date, source,
        )
        return self._row_to_goal(row)

    async def update(self, goal_id: str, **fields: object) -> Goal | None:
        allowed = {"status", "current_value", "description", "target_date", "target_value"}
        updates = {k: v for k, v in fields.items() if k in allowed and v is not None}
        if not updates:
            return await self.get_by_id(goal_id)

        set_clauses = []
        values: list[object] = []
        for i, (key, val) in enumerate(updates.items(), start=1):
            if key == "target_date":
                set_clauses.append(f"{key} = ${i}::date")
            else:
                set_clauses.append(f"{key} = ${i}")
            values.append(val)

        values.append(goal_id)
        set_str = ", ".join(set_clauses)
        row = await self.db.fetchrow(
            f"UPDATE goals SET {set_str}, updated_at = now() WHERE id = ${len(values)} RETURNING *",
            *values,
        )
        if not row:
            return None
        return self._row_to_goal(row)

    async def delete(self, goal_id: str) -> None:
        await self.db.execute("DELETE FROM goals WHERE id = $1", goal_id)

    async def log_progress(self, goal_id: str, value: float, note: str = "") -> GoalLog:
        row = await self.db.fetchrow(
            """INSERT INTO goal_logs (goal_id, value, note)
               VALUES ($1, $2, $3)
               RETURNING *""",
            goal_id, value, note,
        )
        return GoalLog(
            id=str(row["id"]),
            goal_id=str(row["goal_id"]),
            log_date=str(row["log_date"]),
            value=float(row["value"]),
            note=row["note"] or "",
            created_at=str(row["created_at"]),
        )

    async def get_logs(self, goal_id: str) -> list[GoalLog]:
        rows = await self.db.fetch(
            "SELECT * FROM goal_logs WHERE goal_id = $1 ORDER BY log_date DESC",
            goal_id,
        )
        return [
            GoalLog(
                id=str(r["id"]),
                goal_id=str(r["goal_id"]),
                log_date=str(r["log_date"]),
                value=float(r["value"]),
                note=r["note"] or "",
                created_at=str(r["created_at"]),
            )
            for r in rows
        ]

    def _row_to_goal(self, row: dict) -> Goal:
        return Goal(
            id=str(row["id"]),
            category=row["category"],
            title=row["title"],
            description=row["description"] or "",
            target_value=float(row["target_value"]) if row["target_value"] is not None else None,
            current_value=float(row["current_value"]) if row["current_value"] is not None else 0,
            unit=row["unit"] or "",
            start_date=str(row["start_date"]),
            target_date=str(row["target_date"]) if row["target_date"] else None,
            status=row["status"],
            source=row["source"],
            created_at=str(row["created_at"]) if row.get("created_at") else None,
            updated_at=str(row["updated_at"]) if row.get("updated_at") else None,
        )
