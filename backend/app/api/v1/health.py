import sys
from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings
from app.db.session import check_db_connection
from app.schemas.health import HealthResponse, SystemInfoResponse
from app.services.ai.groq_client import groq_configured

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["Health"])
def get_health():
    """
    Comprehensive Phase 1 health check:
    - FastAPI operational state
    - Python runtime version
    - PostgreSQL connection diagnostics
    """
    db_status = check_db_connection()
    overall_status = "healthy" if db_status.get("status") == "connected" else "degraded"

    return HealthResponse(
        status=overall_status,
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        python_version=f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        database=db_status,
        groq_configured=groq_configured(),
        groq_model=settings.GROQ_MODEL,
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@router.get("/system-info", response_model=SystemInfoResponse, tags=["Health"])
def get_system_info():
    """Returns architecture and technology stack baseline."""
    return SystemInfoResponse(
        project_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        phase="Phases 1–8 implemented. PostgreSQL and GROQ_API_KEY are required for live persistence and AI.",
        supported_models=[
            settings.GROQ_MODEL,
            "openai/gpt-oss-120b",
            "qwen/qwen3.8-27b",
            "openai/gpt-oss-20b",
        ],
        storage={
            "upload_dir": settings.UPLOAD_DIR,
            "max_upload_size_mb": settings.MAX_UPLOAD_SIZE_MB
        }
    )

