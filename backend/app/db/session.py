import logging
import socket
from typing import Generator
from urllib.parse import urlparse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.pool import StaticPool
from app.core.config import settings

logger = logging.getLogger(__name__)

# Base class for SQLAlchemy declarative models
Base = declarative_base()

# Configure engine
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 3600,
}

if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
    if ":memory:" in settings.DATABASE_URL:
        engine_kwargs["poolclass"] = StaticPool
elif "postgresql" in settings.DATABASE_URL:
    engine_kwargs["connect_args"] = {"connect_timeout": 2}

try:
    engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
except Exception as e:
    logger.error("Failed to initialize database engine: %s", type(e).__name__)
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def is_db_port_open(url: str, timeout: float = 0.5) -> bool:
    """Fast probe to determine if target database port is open before attempting handshake."""
    try:
        clean_url = url
        for scheme in ["postgresql+psycopg://", "postgresql+psycopg2://", "postgresql://"]:
            if clean_url.startswith(scheme):
                clean_url = "http://" + clean_url[len(scheme):]
                break
        parsed = urlparse(clean_url)
        host = parsed.hostname or "127.0.0.1"
        if host in ("localhost", "::1"):
            host = "127.0.0.1"
        port = parsed.port or 5432
        with socket.create_connection((host, port), timeout=0.2):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

def get_db() -> Generator:
    """Dependency for obtaining database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _public_target(url: str) -> str:
    if url.startswith("sqlite"):
        return "sqlite"
    if "@" in url:
        return url.split("@", 1)[-1]
    return "configured"


def check_db_connection() -> dict:
    """Tests the database connection with fast diagnostics."""
    target = _public_target(settings.DATABASE_URL)
    if not settings.DATABASE_URL.startswith("sqlite") and not is_db_port_open(settings.DATABASE_URL):
        return {
            "status": "disconnected",
            "database_url": target,
            "message": "PostgreSQL port 5432 is not open or the service is not running",
        }

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            return {
                "status": "connected",
                "database_url": target,
                "check_result": result,
                "message": "Database connection active and operational",
            }
    except OperationalError as oe:
        logger.warning("Database operational check failed: %s", type(oe).__name__)
        return {
            "status": "disconnected",
            "database_url": target,
            "message": "Database server is not reachable. Check that PostgreSQL is running and DATABASE_URL is correct.",
        }
    except SQLAlchemyError:
        return {
            "status": "error",
            "database_url": target,
            "message": "Database query failed. Confirm the database exists and the configured user can access it.",
        }
    except Exception:
        return {
            "status": "error",
            "database_url": target,
            "message": "Database connection check failed.",
        }
