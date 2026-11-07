from fastapi import APIRouter, HTTPException

from app.schemas.workspace import AIRequest
from app.services.ai.groq_client import AIConfigurationError, AIProviderError, AIWorkflowError
from app.services.ai.graph import run_workflow

router = APIRouter()

ALLOWED_SOURCES = {"text", "email", "pdf"}


def _execute(payload: AIRequest, stop_after: str) -> dict:
    if payload.source_type not in ALLOWED_SOURCES:
        raise HTTPException(status_code=422, detail="source_type must be text, email, or pdf.")
    data = payload.model_dump()
    data["stop_after"] = stop_after
    try:
        return run_workflow(data)
    except AIConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except AIProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except AIWorkflowError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/ai/extract", tags=["AI"])
def extract_incident(payload: AIRequest):
    return _execute(payload, "extract")


@router.post("/ai/analyze", tags=["AI"])
def analyze_investigation(payload: AIRequest):
    return _execute(payload, "full")


@router.post("/ai/five-whys", tags=["AI"])
def five_whys(payload: AIRequest):
    return _execute(payload, "five_whys")


@router.post("/ai/fishbone", tags=["AI"])
def fishbone(payload: AIRequest):
    return _execute(payload, "fishbone")


@router.post("/ai/root-causes", tags=["AI"])
def root_causes(payload: AIRequest):
    return _execute(payload, "root_causes")


@router.post("/ai/missing-evidence", tags=["AI"])
def missing_evidence(payload: AIRequest):
    return _execute(payload, "missing_evidence")


@router.post("/ai/capa", tags=["AI"])
def capa(payload: AIRequest):
    return _execute(payload, "capa")
