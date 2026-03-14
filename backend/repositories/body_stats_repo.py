from database import DatabaseClient


class BodyStatsRepository:
    def __init__(self, db: DatabaseClient):
        self.db = db

    async def upsert_today(self, weight_kg: float, calories_burnt: int, target_calories: int) -> None:
        await self.db.execute(
            """INSERT INTO body_stats (stat_date, weight_kg, calories_burnt, target_calories)
               VALUES (CURRENT_DATE, $1, $2, $3)
               ON CONFLICT (stat_date)
               DO UPDATE SET weight_kg = $1, calories_burnt = $2, target_calories = $3""",
            weight_kg, calories_burnt, target_calories,
        )

    async def get_today(self) -> dict | None:
        row = await self.db.fetchrow(
            "SELECT * FROM body_stats WHERE stat_date = CURRENT_DATE"
        )
        if not row:
            return None
        return dict(row)

    async def get_weight_history(self) -> list[dict]:
        rows = await self.db.fetch(
            "SELECT stat_date, weight_kg FROM body_stats WHERE weight_kg IS NOT NULL ORDER BY stat_date"
        )
        return [{"date": str(r["stat_date"]), "weight_kg": float(r["weight_kg"])} for r in rows]

    async def get_latest_weight(self) -> float | None:
        val = await self.db.fetchval(
            "SELECT weight_kg FROM body_stats WHERE weight_kg IS NOT NULL ORDER BY stat_date DESC LIMIT 1"
        )
        return float(val) if val else None
