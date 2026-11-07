from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import check_db_connection, get_db


def require_database(db: Session = Depends(get_db)) -> Session:
    status = check_db_connection()
    if status.get("status") != "connected":
        raise HTTPException(
            status_code=503,
            detail={
                "message": (
                    "PostgreSQL is not connected. Start PostgreSQL, create the database ai_rca_db, "
                    "and set DATABASE_URL in the project .env file. Example: "
                    "postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/ai_rca_db. "
                    "Restart the backend after saving .env."
                ),
                "database_status": status.get("status"),
                "database_message": status.get("message"),
            },
        )
    return db
