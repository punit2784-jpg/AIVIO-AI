from datetime import datetime, timezone

from sqlalchemy.orm import Session, selectinload

from app.models.capa import CapaAction
from app.models.evidence import InvestigationEvidence
from app.models.investigation import Investigation
from app.models.root_cause import RootCauseAnalysis

EMPTY_FISHBONE = {
    "manpower": [],
    "machine": [],
    "method": [],
    "material": [],
    "measurement": [],
    "environment": [],
}


def _aware(value):
    if value is None:
        return datetime.now(timezone.utc)
    if isinstance(value, datetime) and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def parse_datetime(value):
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value
    text = str(value).strip()
    if text in {"Not Provided", "Requires Investigation", "null", "None"}:
        return None
    text = text.replace("Z", "+00:00")
    if len(text) == 16:
        text = f"{text}:00"
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def _query(db: Session):
    return db.query(Investigation).options(
        selectinload(Investigation.rca_records),
        selectinload(Investigation.capa_actions),
        selectinload(Investigation.evidence_items),
    )


def next_code(db: Session) -> str:
    year = datetime.now().year
    prefix = f"RCA-{year}-"
    rows = db.query(Investigation.investigation_code).filter(Investigation.investigation_code.like(f"{prefix}%")).all()
    numbers = []
    for (code,) in rows:
        suffix = code.replace(prefix, "")
        if suffix.isdigit():
            numbers.append(int(suffix))
    return f"{prefix}{max(numbers, default=0) + 1:03d}"


def to_workspace(inv: Investigation) -> dict:
    rca = inv.rca_records[0] if inv.rca_records else None
    analysis = (rca.analysis_data or {}) if rca else {}
    fishbone = analysis.get("fishbone") or EMPTY_FISHBONE
    for key in EMPTY_FISHBONE:
        fishbone.setdefault(key, [])
    return {
        "id": inv.id,
        "investigation_code": inv.investigation_code,
        "incident_title": inv.incident_title,
        "incident_description": inv.incident_description,
        "incident_date": _aware(inv.incident_date).isoformat() if inv.incident_date else None,
        "department": inv.department,
        "product_name": inv.product_name,
        "batch_number": inv.batch_number,
        "equipment": inv.equipment,
        "immediate_actions": inv.immediate_actions,
        "investigation_status": inv.investigation_status,
        "severity": analysis.get("severity") or "Major Deviation",
        "methodology": (rca.methodology if rca else None) or "5_whys",
        "five_whys": analysis.get("five_whys") or [],
        "fishbone": fishbone,
        "potential_root_causes": (rca.potential_root_causes if rca else None) or [],
        "confirmed_root_cause": (rca.confirmed_root_cause if rca else None) or "",
        "investigation_conclusion": (rca.investigation_conclusion if rca else None) or "",
        "missing_evidence": analysis.get("missing_evidence") or [],
        "manufacturing_process": analysis.get("manufacturing_process"),
        "observed_abnormality": analysis.get("observed_abnormality"),
        "investigation_observations": analysis.get("investigation_observations"),
        "contributing_factors": analysis.get("contributing_factors") or [],
        "source_input": analysis.get("source_input") or {"type": "text", "fileName": "", "rawContent": ""},
        "capa_actions": [
            {
                "id": action.id,
                "action_type": action.action_type,
                "action_description": action.action_description,
                "justification": action.justification,
                "responsible_role": action.responsible_role,
                "priority": action.priority,
                "effectiveness_verification": action.effectiveness_verification,
                "status": action.status,
            }
            for action in inv.capa_actions
        ],
        "evidence_items": [
            {
                "id": item.id,
                "evidence_name": item.evidence_name,
                "evidence_description": item.evidence_description,
                "evidence_type": item.evidence_type,
                "evidence_status": item.evidence_status,
                "file_path": item.file_path,
            }
            for item in inv.evidence_items
        ],
        "created_at": _aware(inv.created_at),
        "updated_at": _aware(inv.updated_at),
    }


def to_summary(inv: Investigation) -> dict:
    workspace = to_workspace(inv)
    return {
        "id": workspace["id"],
        "investigation_code": workspace["investigation_code"],
        "incident_title": workspace["incident_title"],
        "incident_description": workspace["incident_description"],
        "incident_date": inv.incident_date,
        "department": workspace["department"],
        "product_name": workspace["product_name"],
        "batch_number": workspace["batch_number"],
        "equipment": workspace["equipment"],
        "immediate_actions": workspace["immediate_actions"],
        "investigation_status": workspace["investigation_status"],
        "severity": workspace["severity"],
        "created_at": workspace["created_at"],
        "updated_at": workspace["updated_at"],
    }


def get_investigation(db: Session, investigation_ref: str) -> Investigation | None:
    query = _query(db)
    if str(investigation_ref).isdigit():
        found = query.filter(Investigation.id == int(investigation_ref)).one_or_none()
        if found:
            return found
    return query.filter(Investigation.investigation_code == str(investigation_ref)).one_or_none()


def list_investigations(db: Session) -> list[Investigation]:
    return _query(db).order_by(Investigation.created_at.desc()).all()


def _apply_fields(inv: Investigation, data: dict) -> None:
    inv.incident_title = (data.get("incident_title") or "Not Provided").strip()
    inv.incident_description = (data.get("incident_description") or "Not Provided").strip()
    inv.incident_date = parse_datetime(data.get("incident_date"))
    inv.department = data.get("department")
    inv.product_name = data.get("product_name")
    inv.batch_number = data.get("batch_number")
    inv.equipment = data.get("equipment")
    inv.immediate_actions = data.get("immediate_actions")
    inv.investigation_status = data.get("investigation_status") or "Open"
    inv.updated_at = datetime.now(timezone.utc)


def _sync_children(db: Session, inv: Investigation, data: dict) -> None:
    rca = inv.rca_records[0] if inv.rca_records else None
    if rca is None:
        rca = RootCauseAnalysis(investigation_id=inv.id, methodology=data.get("methodology") or "5_whys")
        db.add(rca)
        inv.rca_records.append(rca)
    rca.methodology = data.get("methodology") or "5_whys"
    rca.analysis_data = {
        "five_whys": data.get("five_whys") or [],
        "fishbone": data.get("fishbone") or EMPTY_FISHBONE,
        "missing_evidence": data.get("missing_evidence") or [],
        "source_input": data.get("source_input") or {},
        "severity": data.get("severity") or "Major Deviation",
        "manufacturing_process": data.get("manufacturing_process"),
        "observed_abnormality": data.get("observed_abnormality"),
        "investigation_observations": data.get("investigation_observations"),
        "contributing_factors": data.get("contributing_factors") or [],
    }
    rca.potential_root_causes = data.get("potential_root_causes") or []
    rca.confirmed_root_cause = data.get("confirmed_root_cause") or None
    rca.investigation_conclusion = data.get("investigation_conclusion") or None
    rca.updated_at = datetime.now(timezone.utc)

    inv.capa_actions.clear()
    db.flush()
    for action in data.get("capa_actions") or []:
        if not action.get("action_description"):
            continue
        db.add(
            CapaAction(
                investigation_id=inv.id,
                action_type=action.get("action_type") or "Corrective",
                action_description=action.get("action_description"),
                justification=action.get("justification"),
                responsible_role=action.get("responsible_role"),
                priority=action.get("priority") or "Medium",
                effectiveness_verification=action.get("effectiveness_verification"),
                status=action.get("status") or "Proposed",
            )
        )

    source = data.get("source_input") or {}
    source_type = source.get("type") or "text"
    if source.get("fileName") or source.get("rawContent") or source.get("filePath"):
        existing = next((item for item in inv.evidence_items if item.evidence_type == f"source-{source_type}"), None)
        if existing is None:
            existing = InvestigationEvidence(
                investigation_id=inv.id,
                evidence_name=source.get("fileName") or f"{source_type} input",
                evidence_type=f"source-{source_type}",
                evidence_status="Collected",
            )
            db.add(existing)
        existing.evidence_name = source.get("fileName") or existing.evidence_name
        existing.evidence_description = "Investigator-supplied source document"
        existing.file_path = source.get("filePath") or source.get("file_path")
        existing.evidence_status = "Collected"


def save_workspace(db: Session, data: dict, investigation_id: int | None = None) -> Investigation:
    inv = None
    if investigation_id is not None:
        inv = get_investigation(db, str(investigation_id))
        if inv is None:
            raise LookupError("Investigation record not found")
    code = (data.get("investigation_code") or "").strip()
    if inv is None and code:
        inv = get_investigation(db, code)
    if inv is None:
        now = datetime.now(timezone.utc)
        inv = Investigation(
            investigation_code=code or next_code(db),
            incident_title=(data.get("incident_title") or "Not Provided").strip(),
            incident_description=(data.get("incident_description") or "Not Provided").strip(),
            investigation_status=data.get("investigation_status") or "Open",
            created_at=now,
            updated_at=now,
        )
        db.add(inv)
        db.flush()
    _apply_fields(inv, data)
    _sync_children(db, inv, data)
    db.commit()
    db.refresh(inv)
    return get_investigation(db, str(inv.id))


def delete_investigation(db: Session, investigation_id: int) -> None:
    inv = get_investigation(db, str(investigation_id))
    if inv is None:
        raise LookupError("Investigation record not found")
    db.delete(inv)
    db.commit()
