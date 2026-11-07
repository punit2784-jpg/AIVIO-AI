import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_router
from app.db.session import engine, Base, check_db_connection
import app.db.base  # noqa: F401  # register SQLAlchemy models before create_all

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("aivoa-backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info(f"Upload directory prepared at: {settings.UPLOAD_DIR}")

    # Initialize tables if database connection is available
    db_check = check_db_connection()
    if db_check.get("status") == "connected":
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables initialized successfully via SQLAlchemy.")
        except Exception as e:
            logger.warning(f"Could not initialize tables automatically: {e}")
    else:
        logger.info(f"Database status: {db_check.get('message', 'Not connected')}. PostgreSQL integration prepared.")

    yield

    # Shutdown
    logger.info("Shutting down AIVOA.AI Backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for AI-Powered Root Cause Analysis Platform (Pharma API Manufacturing)",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permissive for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
        "health": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

