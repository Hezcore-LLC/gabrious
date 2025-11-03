"""
Migration to add Jewish teaching format fields to StudyNotes model
Run this migration with: python migrations/add_jewish_format_fields.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path to import models
sys.path.insert(0, str(Path(__file__).parent.parent))

from tortoise import Tortoise
from dotenv import load_dotenv

load_dotenv()

async def migrate():
    """Add new fields for Jewish teaching format"""
    
    # Initialize database connection
    await Tortoise.init(
        db_url=os.getenv('DATABASE_URL', 'sqlite://db.sqlite3'),
        modules={'models': ['models']}
    )
    
    conn = Tortoise.get_connection("default")
    
    print("Starting migration: Adding Jewish format fields to StudyNotes...")
    
    try:
        # Try to add each column individually, catching errors if they already exist
        columns_to_add = [
            ('format', 'VARCHAR(20)'),
            ('main_text', 'TEXT'),
            ('commentary_layer', 'TEXT'),
            ('ethical_insight', 'TEXT'),
            ('historical_notes', 'TEXT')
        ]
        
        for col_name, col_type in columns_to_add:
            try:
                await conn.execute_query(
                    f'ALTER TABLE studynotes ADD COLUMN {col_name} {col_type}'
                )
                print(f"✓ Added '{col_name}' column")
            except Exception as e:
                if 'duplicate column name' in str(e).lower() or 'already exists' in str(e).lower():
                    print(f"⚠ Column '{col_name}' already exists, skipping")
                else:
                    raise
        
        # Update existing rows to have default format value
        try:
            await conn.execute_query(
                "UPDATE studynotes SET format = 'christian' WHERE format IS NULL"
            )
            print("✓ Updated existing rows with default format")
        except Exception as e:
            print(f"⚠ Could not update default format: {str(e)}")
        
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(migrate())
