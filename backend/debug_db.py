import asyncio
import asyncpg
import os
from dotenv import load_dotenv

async def test_upsert():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    print(f"Connecting to {db_url}...")
    conn = await asyncpg.connect(db_url)
    try:
        # Test inserting a journal entry
        print("Testing journal upsert...")
        # First insertion
        row1 = await conn.fetchrow(
            """INSERT INTO journals (entry_date, went_well, went_bad, reflection, entry_type, title)
               VALUES (CURRENT_DATE, 'well1', 'bad1', 'refl1', 'journal', '')
               ON CONFLICT (entry_date, entry_type, title)
               DO UPDATE SET went_well = EXCLUDED.went_well
               RETURNING *"""
        )
        print(f"Inserted: {dict(row1)}")
        
        # Upsert (update)
        row2 = await conn.fetchrow(
            """INSERT INTO journals (entry_date, went_well, went_bad, reflection, entry_type, title)
               VALUES (CURRENT_DATE, 'well-updated', 'bad1', 'refl1', 'journal', '')
               ON CONFLICT (entry_date, entry_type, title)
               DO UPDATE SET went_well = EXCLUDED.went_well
               RETURNING *"""
        )
        print(f"Updated: {dict(row2)}")
        
        if row2['went_well'] == 'well-updated':
            print("SUCCESS: Journal upsert working.")
        else:
            print("FAILURE: Journal upsert did not update.")

    except Exception as e:
        print(f"ERORR: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(test_upsert())
