"""
Migration to change storage_limit from IntField to BigIntField
to support storage limits larger than 2GB
"""
import asyncio
import sys
import os

# Add parent directory to path so we can import models
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tortoise import Tortoise
from dotenv import load_dotenv

load_dotenv()

async def migrate():
    # Initialize Tortoise ORM
    await Tortoise.init(
        db_url=os.getenv('DATABASE_URL'),
        modules={'models': ['models.user', 'models.subscription', 'models.study_notes', 'models.transcription', 'models.favorite', 'models.metrics']}
    )
    
    # Get connection
    conn = Tortoise.get_connection("default")
    
    # Change storage_limit column from integer to bigint
    await conn.execute_query(
        "ALTER TABLE subscription_plans ALTER COLUMN storage_limit TYPE BIGINT"
    )
    
    print("✓ Changed storage_limit column to BIGINT")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(migrate())
