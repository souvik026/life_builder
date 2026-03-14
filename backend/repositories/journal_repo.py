from database import DatabaseClient
from models.journal import JournalEntry, JournalListItem


class JournalRepository:
    def __init__(self, db: DatabaseClient):
        self.db = db

    def _row_to_entry(self, row) -> JournalEntry:
        return JournalEntry(
            id=str(row["id"]),
            entry_date=str(row["entry_date"]),
            went_well=row["went_well"],
            went_bad=row["went_bad"],
            reflection=row["reflection"] or "",
            ai_insight=row["ai_insight"] or "",
            mood=row["mood"] or "",
            created_at=str(row["created_at"]),
        )

    async def upsert(self, went_well: str, went_bad: str, reflection: str = "", mood: str | None = None) -> JournalEntry:
        row = await self.db.fetchrow(
            """INSERT INTO journals (entry_date, went_well, went_bad, reflection, mood)
               VALUES (CURRENT_DATE, $1, $2, $3, $4)
               ON CONFLICT (entry_date)
               DO UPDATE SET went_well = $1, went_bad = $2, reflection = $3, mood = $4
               RETURNING *""",
            went_well, went_bad, reflection, mood,
        )
        return self._row_to_entry(row)

    async def get_by_date(self, entry_date: str) -> JournalEntry | None:
        row = await self.db.fetchrow(
            "SELECT * FROM journals WHERE entry_date = $1", entry_date
        )
        if not row:
            return None
        return self._row_to_entry(row)

    async def list_entries(self, limit: int = 90) -> list[JournalListItem]:
        rows = await self.db.fetch(
            "SELECT id, entry_date, mood FROM journals ORDER BY entry_date DESC LIMIT $1",
            limit,
        )
        return [
            JournalListItem(
                id=str(r["id"]),
                entry_date=str(r["entry_date"]),
                mood=r["mood"] or "",
            )
            for r in rows
        ]

    async def get_mood_history(self) -> list[dict]:
        rows = await self.db.fetch(
            "SELECT entry_date, mood FROM journals WHERE mood IS NOT NULL ORDER BY entry_date"
        )
        return [{"date": str(r["entry_date"]), "mood": r["mood"]} for r in rows]
