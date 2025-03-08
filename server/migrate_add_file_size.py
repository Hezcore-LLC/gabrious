import asyncio
import os
from tortoise import Tortoise
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def run_migration():
    # Connect to the database
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db.sqlite3')
    db_url = f"sqlite://{db_path}"
    
    await Tortoise.init(
        db_url=db_url,
        modules={'models': ['models']}
    )
    
    # Execute raw SQL to add the file_size column if it doesn't exist
    conn = Tortoise.get_connection('default')
    
    # Check if column exists
    result = await conn.execute_query(
        "PRAGMA table_info(transcription);"
    )
    
    columns = [column[1] for column in result[1]]
    if 'file_size' not in columns:
        print("Adding file_size column to transcription table...")
        await conn.execute_script(
            "ALTER TABLE transcription ADD COLUMN file_size BIGINT DEFAULT 0;"
        )
        print("Column added successfully!")
    else:
        print("file_size column already exists.")
    
    # Close connection
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(run_migration())