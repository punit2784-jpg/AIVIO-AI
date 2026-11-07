import re
import uuid
from pathlib import Path

import fitz

from app.core.config import settings

MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def extract_pdf_bytes(data: bytes, filename: str) -> dict:
    if not data:
        raise ValueError("The uploaded PDF is empty.")
    if len(data) > MAX_BYTES:
        raise ValueError(f"PDF exceeds the {settings.MAX_UPLOAD_SIZE_MB} MB upload limit.")
    if not filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF documents can be parsed.")

    try:
        document = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise ValueError("The file could not be read as a PDF.") from exc

    pages = []
    try:
        for page in document:
            pages.append(page.get_text("text") or "")
        page_count = document.page_count
    finally:
        document.close()

    text = re.sub(r"\n{3,}", "\n\n", "\n\n".join(pages)).strip()
    return {
        "filename": Path(filename).name,
        "page_count": page_count,
        "text": text,
        "character_count": len(text),
    }


def save_upload(data: bytes, filename: str) -> str:
    safe_name = Path(filename).name.replace(" ", "_")
    destination_dir = Path(settings.UPLOAD_DIR)
    destination_dir.mkdir(parents=True, exist_ok=True)
    destination = destination_dir / f"{uuid.uuid4().hex[:12]}_{safe_name}"
    destination.write_bytes(data)
    return str(destination)
