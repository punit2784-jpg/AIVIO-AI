NOT_PROVIDED = "Not Provided"
REQUIRES = "Requires Investigation"
FISHBONE_KEYS = ("manpower", "machine", "method", "material", "measurement", "environment")
STRENGTHS = {"AI Hypothesis", "Evidence-Supported"}
CONFIDENCE = {"Low", "Medium", "High"}
PRIORITIES = {"Critical", "High", "Medium", "Low"}


def _text(value, default=NOT_PROVIDED) -> str:
    if value is None:
        return default
    text = str(value).strip()
    return text or default


def _as_list(value) -> list:
    if value is None or value == "":
        return []
    if isinstance(value, list):
        return value
    return [value]


def normalize_incident(data) -> dict:
    source = data or {}
    if isinstance(source, dict) and isinstance(source.get("incident"), dict):
        source = source["incident"]
    if not isinstance(source, dict):
        source = {}

    description = _text(source.get("incident_description"), "")
    abnormality = _text(source.get("observed_abnormality"), "")
    if abnormality and abnormality not in {NOT_PROVIDED, REQUIRES} and abnormality not in description:
        description = f"{description}\n\nObserved abnormality: {abnormality}".strip()

    raw_date = source.get("incident_date")
    date_out = None
    if raw_date and str(raw_date).strip() not in {NOT_PROVIDED, REQUIRES, "null", "None"}:
        date_out = str(raw_date).strip()

    return {
        "incident_title": _text(source.get("incident_title")),
        "incident_description": description or NOT_PROVIDED,
        "incident_date": date_out,
        "department": _text(source.get("department")),
        "manufacturing_process": _text(source.get("manufacturing_process")),
        "product_name": _text(source.get("product_name")),
        "batch_number": _text(source.get("batch_number")),
        "equipment": _text(source.get("equipment")),
        "immediate_actions": _text(source.get("immediate_actions")),
        "observed_abnormality": abnormality or NOT_PROVIDED,
        "investigation_observations": _text(source.get("investigation_observations")),
        "available_evidence": [str(item).strip() for item in _as_list(source.get("available_evidence")) if str(item).strip()],
        "contributing_factors": [
            str(item).strip()
            for item in _as_list(source.get("potential_contributing_factors") or source.get("contributing_factors"))
            if str(item).strip()
        ],
    }


def normalize_five_whys(items) -> list:
    if isinstance(items, dict):
        items = items.get("five_whys") or items.get("steps") or []
    steps = []
    for index, item in enumerate(items or [], start=1):
        if not isinstance(item, dict):
            continue
        answer = _text(item.get("answer"), REQUIRES)
        if answer == NOT_PROVIDED:
            answer = REQUIRES
        evidence = _text(item.get("evidence"), NOT_PROVIDED)
        needed = _text(item.get("evidence_needed"), "")
        if evidence in {NOT_PROVIDED, ""} and needed in {"", NOT_PROVIDED}:
            needed = REQUIRES
        if needed == NOT_PROVIDED:
            needed = ""
        question = item.get("why_question") or item.get("question")
        steps.append(
            {
                "id": index,
                "why_question": _text(question, f"Why #{index}?"),
                "answer": answer,
                "evidence": evidence,
                "evidence_needed": needed,
            }
        )
    return steps


def normalize_fishbone(data) -> dict:
    source = data.get("fishbone") if isinstance(data, dict) and isinstance(data.get("fishbone"), dict) else data
    if not isinstance(source, dict):
        source = {}
    diagram = {}
    for key in FISHBONE_KEYS:
        causes = []
        for index, item in enumerate(source.get(key) or [], start=1):
            if isinstance(item, str):
                item = {"cause": item, "evidence": NOT_PROVIDED}
            if not isinstance(item, dict):
                continue
            cause = _text(item.get("cause"), "")
            if not cause or cause == NOT_PROVIDED:
                continue
            causes.append(
                {
                    "id": item.get("id") or f"{key[:2]}-{index}",
                    "cause": cause,
                    "evidence": _text(item.get("evidence"), NOT_PROVIDED),
                }
            )
        diagram[key] = causes
    return diagram


def normalize_causes(items) -> list:
    if isinstance(items, dict):
        items = items.get("potential_root_causes") or items.get("causes") or []
    causes = []
    for index, item in enumerate(items or [], start=1):
        if not isinstance(item, dict):
            continue
        evidence = _text(item.get("supporting_evidence"), NOT_PROVIDED)
        strength = str(item.get("evidence_strength") or "AI Hypothesis").strip()
        if strength not in STRENGTHS:
            strength = "AI Hypothesis"
        confidence = str(item.get("confidence") or "Low").strip().title()
        if confidence not in CONFIDENCE:
            confidence = "Low"
        if evidence in {NOT_PROVIDED, REQUIRES}:
            strength = "AI Hypothesis"
            if confidence == "High":
                confidence = "Low"
        causes.append(
            {
                "id": item.get("id") or f"prc-{index}",
                "description": _text(item.get("description")),
                "reasoning": _text(item.get("reasoning")),
                "supporting_evidence": evidence,
                "confidence": confidence,
                "evidence_strength": strength,
                "missing_information": _text(item.get("missing_information"), ""),
                "is_confirmed": False,
            }
        )
    return causes


def normalize_missing(items) -> list:
    if isinstance(items, dict):
        items = items.get("missing_evidence") or items.get("items") or []
    gaps = []
    for index, item in enumerate(items or [], start=1):
        if isinstance(item, str):
            item = {"item": item}
        if not isinstance(item, dict):
            continue
        name = _text(item.get("item") or item.get("name"), "")
        if not name or name == NOT_PROVIDED:
            continue
        gaps.append(
            {
                "id": item.get("id") or f"me-{index}",
                "item": name,
                "status": "Suggested",
                "required": bool(item.get("required", True)),
                "category": _text(item.get("category"), "Documentation"),
                "rationale": _text(item.get("rationale") or item.get("reason"), ""),
            }
        )
    return gaps


def normalize_capa(items) -> list:
    if isinstance(items, dict):
        items = items.get("capa_actions") or items.get("actions") or []
    actions = []
    for index, item in enumerate(items or [], start=1):
        if not isinstance(item, dict):
            continue
        raw_type = str(item.get("action_type") or "Corrective").lower()
        action_type = "Preventive" if "prevent" in raw_type else "Corrective"
        priority = str(item.get("priority") or "Medium").strip().title()
        if priority not in PRIORITIES:
            priority = "Medium"
        description = _text(item.get("action_description"), "")
        if not description or description == NOT_PROVIDED:
            continue
        actions.append(
            {
                "id": item.get("id") or f"capa-{index}",
                "action_type": action_type,
                "action_description": description,
                "justification": _text(item.get("justification") or item.get("reason")),
                "responsible_role": _text(item.get("responsible_role"), "Quality Assurance"),
                "priority": priority,
                "effectiveness_verification": _text(item.get("effectiveness_verification")),
                "status": "Proposed",
            }
        )
    return actions
