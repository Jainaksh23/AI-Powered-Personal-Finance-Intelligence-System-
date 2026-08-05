from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "pfis.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def auto_migrate_sqlite():
    """
    Ensures missing columns added during model upgrades are automatically migrated into SQLite tables.
    """
    if not os.path.exists(DATABASE_PATH):
        return

    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Check if 'expenses' table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'")
        if cursor.fetchone():
            cursor.execute("PRAGMA table_info(expenses)")
            existing_cols = [row[1] for row in cursor.fetchall()]
            
            new_columns = [
                ("transaction_source", "VARCHAR"),
                ("merchant_name", "VARCHAR"),
                ("transaction_reference", "VARCHAR"),
                ("confidence_score", "FLOAT DEFAULT 1.0"),
                ("verification_status", "VARCHAR DEFAULT 'Confirmed'"),
                ("duplicate_flag", "BOOLEAN DEFAULT 0"),
                ("ai_category", "VARCHAR"),
                ("detection_timestamp", "DATETIME")
            ]
            
            for col_name, col_type in new_columns:
                if col_name not in existing_cols:
                    cursor.execute(f"ALTER TABLE expenses ADD COLUMN {col_name} {col_type}")
            conn.commit()
        conn.close()
    except Exception as e:
        print("Auto-migration notice:", e)

auto_migrate_sqlite()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
