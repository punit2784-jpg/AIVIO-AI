from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.investigations import router as investigations_router
from app.api.v1.documents import router as documents_router
from app.api.v1.ai import router as ai_router
from app.api.v1.evidence import router as evidence_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="", tags=["Health"])
api_router.include_router(investigations_router, prefix="", tags=["Investigations"])
api_router.include_router(documents_router, prefix="", tags=["Documents"])
api_router.include_router(ai_router, prefix="", tags=["AI"])
api_router.include_router(evidence_router, prefix="", tags=["Evidence"])

__all__ = ["api_router"]

