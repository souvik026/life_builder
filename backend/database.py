import asyncpg
from config import Settings


class DatabaseClient:
    """Async PostgreSQL connection pool (singleton)."""

    def __init__(self, settings: Settings):
        self.dsn = settings.database_url
        self.pool: asyncpg.Pool | None = None

    async def connect(self) -> None:
        try:
            self.pool = await asyncpg.create_pool(dsn=self.dsn, min_size=2, max_size=10)
        except Exception as e:
            print(f"CRITICAL: Failed to connect to database at {self.dsn}")
            print(f"Error details: {e}")
            raise e

    async def close(self) -> None:
        if self.pool:
            await self.pool.close()

    async def fetch(self, query: str, *args) -> list[asyncpg.Record]:
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)

    async def fetchrow(self, query: str, *args) -> asyncpg.Record | None:
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)

    async def fetchval(self, query: str, *args):
        async with self.pool.acquire() as conn:
            return await conn.fetchval(query, *args)

    async def execute(self, query: str, *args) -> str:
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)
