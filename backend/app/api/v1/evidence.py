from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import require_database
from app.models.evidence import InvestigationEvidence
from app.services.documents import save_upload
from app.services.investigations import get_investigation

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".csv", ".png", ".jpg", ".jpeg"}


@router.post("/evidence/upload", tags=["Evidence"])
async def upload_evidence(
    investigation_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(require_database),
):
    record = get_investigation(db, str(investigation_id))
    if record is None:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    filename = file.filename or "evidence"
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported evidence file. Upload a PDF, TXT, CSV, PNG, or JPG.",
        )
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="The evidence file is empty.")
    if len(data) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Evidence files must be 25 MB or smaller.")

    stored_path = save_upload(data, filename)
    item = InvestigationEvidence(
        investigation_id=record.id,
        evidence_name=Path(filename).name,
        evidence_description="Supporting evidence uploaded by the investigator",
        evidence_type=extension.lstrip("."),
        evidence_status="Collected",
        file_path=stored_path,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {
        "id": item.id,
        "investigation_id": item.investigation_id,
        "evidence_name": item.evidence_name,
        "evidence_type": item.evidence_type,
        "evidence_status": item.evidence_status,
        "file_path": item.file_path,
    }


@router.get("/evidence/{investigation_id}", tags=["Evidence"])
def list_evidence(investigation_id: int, db: Session = Depends(require_database)):
    record = get_investigation(db, str(investigation_id))
    if record is None:
        raise HTTPException(status_code=404, detail="Investigation record not found")
    return [
        {
            "id": item.id,
            "investigation_id": item.investigation_id,
            "evidence_name": item.evidence_name,
            "evidence_description": item.evidence_description,
            "evidence_type": item.evidence_type,
            "evidence_status": item.evidence_status,
            "file_path": item.file_path,
        }
        for item in record.evidence_items
    ]
