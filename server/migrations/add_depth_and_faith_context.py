"""
Migration to add depth_mode and faith_context fields
Run this migration with: python migrations/add_depth_and_faith_context.py
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
    """Add depth_mode and faith_context fields"""
    
    # Initialize database connection
    await Tortoise.init(
        db_url=os.getenv('DATABASE_URL', 'sqlite://db.sqlite3'),
        modules={'models': ['models']}
    )
    
    conn = Tortoise.get_connection("default")
    
    print("Starting migration: Adding depth_mode and faith_context fields...")
    
    try:
        # Add columns to studynotes table
        columns_studynotes = [
            ('depth_mode', 'VARCHAR(20)'),
            ('cross_references', 'TEXT'),  # JSON
            ('personal_notes', 'TEXT'),  # JSON
            ('highlights', 'TEXT'),  # JSON
        ]
        
        for col_name, col_type in columns_studynotes:
            try:
                await conn.execute_query(
                    f'ALTER TABLE studynotes ADD COLUMN {col_name} {col_type}'
                )
                print(f"✓ Added '{col_name}' column to studynotes")
            except Exception as e:
                if 'duplicate column name' in str(e).lower() or 'already exists' in str(e).lower():
                    print(f"⚠ Column '{col_name}' already exists in studynotes, skipping")
                else:
                    raise
        
        # Update existing rows to have default depth_mode
        try:
            await conn.execute_query(
                "UPDATE studynotes SET depth_mode = 'intermediate' WHERE depth_mode IS NULL"
            )
            print("✓ Updated existing studynotes with default depth_mode")
        except Exception as e:
            print(f"⚠ Could not update default depth_mode: {str(e)}")
        
        # Add columns to users table
        columns_users = [
            ('faith_context', 'VARCHAR(20)'),
            ('preferred_depth_mode', 'VARCHAR(20)'),
            ('preferred_language', 'VARCHAR(10)'),
            ('show_original_language', 'INTEGER'),  # SQLite uses INTEGER for BOOLEAN
        ]
        
        for col_name, col_type in columns_users:
            try:
                await conn.execute_query(
                    f'ALTER TABLE users ADD COLUMN {col_name} {col_type}'
                )
                print(f"✓ Added '{col_name}' column to users")
            except Exception as e:
                if 'duplicate column name' in str(e).lower() or 'already exists' in str(e).lower():
                    print(f"⚠ Column '{col_name}' already exists in users, skipping")
                else:
                    raise
        
        # Update existing users with defaults
        try:
            await conn.execute_query(
                "UPDATE users SET faith_context = 'christian' WHERE faith_context IS NULL"
            )
            await conn.execute_query(
                "UPDATE users SET preferred_depth_mode = 'intermediate' WHERE preferred_depth_mode IS NULL"
            )
            await conn.execute_query(
                "UPDATE users SET preferred_language = 'en' WHERE preferred_language IS NULL"
            )
            await conn.execute_query(
                "UPDATE users SET show_original_language = 0 WHERE show_original_language IS NULL"
            )
            print("✓ Updated existing users with default values")
        except Exception as e:
            print(f"⚠ Could not update default user values: {str(e)}")
        
        print("\n✅ Migration completed successfully!")
        print("\nNew features enabled:")
        print("  - Depth modes (basic, intermediate, advanced)")
        print("  - Faith context (christian, jewish)")
        print("  - User preferences for depth and language")
        print("  - Support for cross-references and personal notes (future)")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(migrate())
