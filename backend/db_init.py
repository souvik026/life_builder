import asyncio
import asyncpg
import os
from dotenv import load_dotenv

async def init_db():
    # Only load the parts needed for initial connection (without /habitdb)
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    # Base URL to postgres database
    base_url = db_url.rsplit("/", 1)[0] + "/postgres"
    
    print(f"Connecting to {base_url}...")
    try:
        # 1. Create habitdb
        conn = await asyncpg.connect(base_url)
        try:
            await conn.execute("CREATE DATABASE habitdb")
            print("Database 'habitdb' created successfully.")
        except asyncpg.DuplicateDatabaseError:
            print("Database 'habitdb' already exists.")
        finally:
            await conn.close()

        # 2. Connect to habitdb and run schema
        print(f"Connecting to {db_url} to run schema...")
        conn = await asyncpg.connect(db_url)
        try:
            with open("schema.sql", "r") as f:
                schema = f.read()
            await conn.execute(schema)
            print("Schema initialized successfully.")
        finally:
            await conn.close()
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(init_db())
