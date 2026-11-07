from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_database
from app.schemas.workspace import InvestigationSummary, WorkspaceIn, WorkspaceOut
from app.services.investigations import (
    delete_investigation,
    get_investigation,
    list_investigations,
    save_workspace,
    to_summary,
    to_workspace,
)

router = APIRouter()


@router.get("/investigations", response_model=list[InvestigationSummary], tags=["Investigations"])
def list_investigation_records(db: Session = Depends(require_database)):
    return [to_summary(item) for item in list_investigations(db)]


@router.post("/investigations", response_model=WorkspaceOut, tags=["Investigations"])
def create_investigation(payload: WorkspaceIn, db: Session = Depends(require_database)):
    record = save_workspace(db, payload.model_dump())
    return to_workspace(record)


@router.get("/investigations/{investigation_ref}", response_model=WorkspaceOut, tags=["Investigations"])
def get_investigation_record(investigation_ref: str, db: Session = Depends(require_database)):
    record = get_investigation(db, investigation_ref)
    if record is None:
        raise HTTPException(status_code=404, detail="Investigation record not found")
    return to_workspace(record)


@router.put("/investigations/{investigation_id}", response_model=WorkspaceOut, tags=["Investigations"])
def update_investigation(investigation_id: int, payload: WorkspaceIn, db: Session = Depends(require_database)):
    try:
        record = save_workspace(db, payload.model_dump(), investigation_id=investigation_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return to_workspace(record)


@router.delete("/investigations/{investigation_id}", status_code=204, tags=["Investigations"])
def remove_investigation(investigation_id: int, db: Session = Depends(require_database)):
    try:
        delete_investigation(db, investigation_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
