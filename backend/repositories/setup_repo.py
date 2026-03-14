import hashlib
from datetime import date
from database import DatabaseClient
from models.setup import SetupStatus, SetupConfig


class SetupRepository:
    def __init__(self, db: DatabaseClient):
        self.db = db

    async def get_status(self) -> SetupStatus:
        row = await self.db.fetchrow("SELECT * FROM setup_config LIMIT 1")
        if not row:
            return SetupStatus(is_locked=False, start_date=None, day_number=0, end_date=None)

        start = row["start_date"]
        end = row["end_date"]
        day_number = (date.today() - start).days + 1 if start else 0

        return SetupStatus(
            is_locked=row["is_locked"],
            start_date=str(start) if start else None,
            day_number=max(day_number, 0),
            end_date=str(end) if end else None,
        )

    async def get_config(self) -> SetupConfig | None:
        row = await self.db.fetchrow("SELECT * FROM setup_config LIMIT 1")
        if not row:
            return None
        return SetupConfig(
            user_name=row["user_name"],
            start_date=str(row["start_date"]),
            end_date=str(row["end_date"]),
            start_weight=float(row["start_weight"]) if row["start_weight"] else 0,
            target_weight=float(row["target_weight"]) if row["target_weight"] else 0,
            target_calories=row["target_calories"],
            whatsapp_number=row["whatsapp_number"] or "",
            habits_md_raw=row["habits_md_raw"] or "",
            timed_tasks_raw=row["timed_tasks_raw"] or "",
            config_hash=row["config_hash"] or "",
            is_locked=row["is_locked"],
        )

    async def is_locked(self) -> bool:
        val = await self.db.fetchval("SELECT is_locked FROM setup_config LIMIT 1")
        return val is True

    async def create_and_lock(
        self,
        user_name: str,
        start_date: str,
        start_weight: float,
        target_weight: float,
        target_calories: int,
        whatsapp_number: str,
        habits_md_raw: str,
        timed_tasks_raw: str = "",
    ) -> str:
        """Create setup config and lock it. Returns config_hash."""
        # Generate hash from config
        raw = f"{user_name}{start_date}{start_weight}{target_weight}{habits_md_raw}"
        config_hash = hashlib.sha256(raw.encode()).hexdigest()[:16]

        # Delete existing (singleton enforcement)
        await self.db.execute("DELETE FROM setup_config")

        await self.db.execute(
            """INSERT INTO setup_config
               (user_name, start_date, start_weight, target_weight, target_calories,
                whatsapp_number, habits_md_raw, timed_tasks_raw, config_hash, is_locked, locked_at)
               VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8, $9, true, now())""",
            user_name, start_date, start_weight, target_weight, target_calories,
            whatsapp_number, habits_md_raw, timed_tasks_raw, config_hash,
        )
        return config_hash
