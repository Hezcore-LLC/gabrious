"""
Migration to update existing 'general' faith_context values to 'christian'
Run this migration with: python migrations/fix_faith_context_values.py
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
    """Update existing 'general' and 'muslim' faith_context values to 'christian'"""
    
    # Initialize database connection
    await Tortoise.init(
        db_url=os.getenv('DATABASE_URL', 'sqlite://db.sqlite3'),
        modules={'models': ['models']}
    )
    
    conn = Tortoise.get_connection("default")
    
    print("Starting migration: Fixing faith_context values...")
    
    try:
        # Update 'general' to 'christian'
        result = await conn.execute_query(
            "UPDATE users SET faith_context = 'christian' WHERE faith_context = 'general'"
        )
        print(f"✓ Updated 'general' faith_context values to 'christian'")
        
        # Update 'muslim' to 'christian' (if any exist)
        result = await conn.execute_query(
            "UPDATE users SET faith_context = 'christian' WHERE faith_context = 'muslim'"
        )
        print(f"✓ Updated 'muslim' faith_context values to 'christian'")
        
        # Update NULL values to 'christian'
        result = await conn.execute_query(
            "UPDATE users SET faith_context = 'christian' WHERE faith_context IS NULL"
        )
        print(f"✓ Updated NULL faith_context values to 'christian'")
        
        # Show summary
        result = await conn.execute_query(
            "SELECT faith_context, COUNT(*) as count FROM users GROUP BY faith_context"
        )
        print("\n📊 Current faith_context distribution:")
        for row in result[1]:
            print(f"   - {row['faith_context']}: {row['count']} users")
        
        print("\n✅ Migration completed successfully!")
        print("\nAll users now have valid faith_context values (christian or jewish)")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(migrate())
