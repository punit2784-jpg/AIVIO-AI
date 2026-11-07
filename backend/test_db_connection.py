"""
Database Connectivity Test Utility for AIVOA.AI RCA Platform
Tests the connection to PostgreSQL and verifies schema tables.
"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.db.session import engine, check_db_connection, Base
from sqlalchemy import text

def test_connection():
    print("=" * 60)
    print(" AIVOA.AI - PostgreSQL Connectivity Diagnostic Utility")
    print("=" * 60)
    print(f"Configured DATABASE_URL: {settings.DATABASE_URL}")
    print("\nAttempting connection to PostgreSQL...")

    result = check_db_connection()
    status = result.get("status")
    print(f"Status: {status.upper()}")
    print(f"Message: {result.get('message')}")

    if status == "connected":
        print("\n[SUCCESS] Connection established! Verifying table generation...")
        try:
            Base.metadata.create_all(bind=engine)
            print("[SUCCESS] All SQLAlchemy models successfully mapped:")
            for table_name in Base.metadata.tables.keys():
                print(f"  - {table_name}")
            return True
        except Exception as e:
            print(f"[ERROR] Failed during table creation check: {e}")
            return False
    else:
        print("\n[DIAGNOSTIC NOTICE]")
        print("PostgreSQL is not currently reachable with the current DATABASE_URL.")
        if "error_detail" in result:
            print(f"Details: {result['error_detail']}")
        print("\nTo connect to your PostgreSQL instance:")
        print("1. Ensure the PostgreSQL service is running on your machine.")
        print("2. Ensure the database 'ai_rca_db' exists: CREATE DATABASE ai_rca_db;")
        print("3. Update DATABASE_URL in .env with your credentials:")
        print("   DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/ai_rca_db")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)

