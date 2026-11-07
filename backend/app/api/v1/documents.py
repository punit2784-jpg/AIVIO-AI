from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.documents import extract_pdf_bytes, save_upload

router = APIRouter()


@router.post("/documents/parse", tags=["Documents"])
async def parse_pdf(file: UploadFile = File(...)):
    filename = file.filename or "investigation.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files can be parsed. Paste incident text or email content for other sources.")
    data = await file.read()
    try:
        parsed = extract_pdf_bytes(data, filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not parsed["text"]:
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted from this PDF. It may be scanned or image-only. Paste the incident text instead.",
        )
    stored_path = save_upload(data, filename)
    return {**parsed, "stored_path": stored_path, "source_type": "pdf"}
