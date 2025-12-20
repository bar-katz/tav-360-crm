#!/usr/bin/env python3
"""
Simple database migration script
Runs SQL migration files in order
"""
import os
import sys
import psycopg2
from pathlib import Path

def get_migration_files():
    """Get all migration files sorted by number"""
    migrations_dir = Path(__file__).parent.parent / "migrations"
    files = sorted(migrations_dir.glob("*.sql"), key=lambda x: int(x.stem.split("_")[0]))
    return files

def run_migration(conn, migration_file):
    """Run a single migration file"""
    print(f"Running migration: {migration_file.name}")
    with open(migration_file, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    cursor = conn.cursor()
    try:
        cursor.execute(sql)
        conn.commit()
        print(f"✓ Successfully applied {migration_file.name}")
    except Exception as e:
        conn.rollback()
        print(f"✗ Error applying {migration_file.name}: {e}")
        raise

def main():
    """Main migration function"""
    database_url = os.getenv("DATABASE_URL", "postgresql://tav360:tav360secret@localhost:5432/tav360_crm")
    
    try:
        conn = psycopg2.connect(database_url)
        print(f"Connected to database")
        
        migration_files = get_migration_files()
        print(f"Found {len(migration_files)} migration files")
        
        for migration_file in migration_files:
            run_migration(conn, migration_file)
        
        conn.close()
        print("\n✓ All migrations completed successfully!")
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

