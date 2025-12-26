#!/usr/bin/env python3
"""
Simple database migration script
Runs SQL migration files in order
"""
import os
import sys
import psycopg2
from psycopg2 import errors
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
    # Remove comments and split by semicolon, but be careful with semicolons inside statements
    # Simple approach: split by semicolon and filter out comments
    lines = sql.split('\n')
    statements = []
    current_stmt = []
    
    for line in lines:
        stripped = line.strip()
        # Skip comment lines
        if stripped.startswith('--'):
            continue
        # Skip empty lines
        if not stripped:
            continue
        
        current_stmt.append(line)
        # If line ends with semicolon, it's the end of a statement
        if stripped.endswith(';'):
            stmt = '\n'.join(current_stmt).strip()
            if stmt:
                statements.append(stmt.rstrip(';'))  # Remove trailing semicolon
            current_stmt = []
    
    # Execute each statement separately
    print(f"  Found {len(statements)} statements to execute")
    for i, statement in enumerate(statements):
        if not statement.strip():
            continue
        print(f"  Executing statement {i+1}: {statement[:50]}...")
        try:
            cursor.execute(statement)
            conn.commit()
        except (errors.DuplicateTable, errors.DuplicateObject) as e:
            # These are expected when objects already exist
            print(f"  ⚠ Skipped statement {i+1} (already exists): {type(e).__name__}")
            conn.rollback()
        except Exception as e:
            error_msg = str(e)
            error_lower = error_msg.lower()
            # Also check for "already exists" in the message as fallback
            if 'already exists' in error_lower:
                print(f"  ⚠ Skipped statement {i+1} (already exists): {error_msg.strip()}")
                conn.rollback()
            else:
                conn.rollback()
                print(f"✗ Error applying {migration_file.name} at statement {i+1}: {e}")
                print(f"  Exception type: {type(e).__name__}")
                print(f"  Statement: {statement[:200]}...")
                raise
    
    print(f"✓ Successfully applied {migration_file.name}")

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

