import os
from pathlib import Path

TEST_DB = Path(__file__).resolve().parent / "test_rca.db"
if TEST_DB.exists():
    TEST_DB.unlink()

os.environ["DATABASE_URL"] = "sqlite:///" + TEST_DB.as_posix()
os.environ["GROQ_API_KEY"] = ""

from app.db.base import Base  # noqa: E402
from app.db.session import engine  # noqa: E402

Base.metadata.create_all(bind=engine)
