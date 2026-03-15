import asyncio
import asyncpg
import os
from dotenv import load_dotenv

async def apply_fix():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    print(f"Connecting to {db_url}...")
    conn = await asyncpg.connect(db_url)
    try:
        print("Applying UNIQUE constraint to journals table...")
        await conn.execute("""
            ALTER TABLE journals 
            ADD CONSTRAINT journals_date_type_title_key 
            UNIQUE (entry_date, entry_type, title);
        """)
        print("SUCCESS: Constraint added.")
    except asyncpg.DuplicateObjectError:
        print("INFO: Constraint already exists.")
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(apply_fix())
