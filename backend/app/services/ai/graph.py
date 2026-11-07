import json
from typing import TypedDict

from langgraph.graph import END, StateGraph


class RCAState(TypedDict, total=False):
    content: str
    source_type: str
    methodology: str
    stop_after: str
    incident: dict
    five_whys: list
    fishbone: dict
    potential_root_causes: list
    missing_evidence: list
    capa_actions: list
    errors: list
    validated: bool

from app.services.ai.groq_client import complete_json
from app.services.ai.normalize import (
    normalize_capa,
    normalize_causes,
    normalize_fishbone,
    normalize_five_whys,
    normalize_incident,
    normalize_missing,
)

NOTICE = (
    "These findings are AI-generated suggestions for a qualified investigator to review. "
    "They are not a confirmed root cause, and CAPA actions are not approved or closed."
)

SYSTEM_PROMPT = """You support pharmaceutical API manufacturing root cause analysis.
Rules:
- Use only facts stated in the supplied investigation text.
- Never invent dates, measurements, batch numbers, equipment IDs, names, document numbers, or record reviews.
- When a fact is absent, use exactly "Not Provided".
- When a cause cannot be supported, use exactly "Requires Investigation" and name the evidence that would be needed.
- Never mark a cause as human-confirmed or as an established fact.
- Do not say a record exists or was reviewed unless the text says so.
- Suspected causes, including cooling-system performance, remain hypotheses until evidence is supplied.
- Return one JSON object and no markdown.
"""


def _context(state: dict) -> str:
    payload = {
        "source_type": state.get("source_type") or "text",
        "methodology": state.get("methodology") or "5_whys",
        "incident": state.get("incident") or {},
        "five_whys": state.get("five_whys") or [],
        "fishbone": state.get("fishbone") or {},
        "potential_root_causes": state.get("potential_root_causes") or [],
        "content": (state.get("content") or "")[:12000],
    }
    return json.dumps(payload, default=str)


def _blocked(state: dict) -> bool:
    return bool(state.get("errors"))


def extract_content(state: dict) -> dict:
    text = (state.get("content") or "").strip()
    if text.startswith("[Attached PDF"):
        return {
            "errors": [
                "The PDF has not been parsed yet. Upload the PDF so PyMuPDF can extract text, or paste the incident text."
            ]
        }
    if len(text) < 20:
        incident = state.get("incident") or {}
        if incident:
            text = json.dumps(incident, default=str)
    if len(text.strip()) < 20:
        return {"errors": ["Provide at least 20 characters of incident text, email content, or extracted PDF text."]}
    return {"content": text.strip(), "errors": []}


def extract_incident(state: dict) -> dict:
    if _blocked(state):
        return {}
    stop = state.get("stop_after") or "full"
    existing = state.get("incident") or {}
    title = str(existing.get("incident_title") or "").strip()
    if stop not in {"extract", "full"} and title and title != "Not Provided":
        return {}
    raw = complete_json(
        SYSTEM_PROMPT,
        "Extract incident fields from this investigation input. "
        "Return JSON with an 'incident' object containing incident_title, incident_description, "
        "incident_date, department, manufacturing_process, product_name, batch_number, equipment, "
        "observed_abnormality, immediate_actions, investigation_observations, available_evidence, "
        "and potential_contributing_factors. Use Not Provided for unknown fields.\n"
        f"Input:\n{_context(state)}",
    )
    return {"incident": normalize_incident(raw)}


def analyze_investigation(state: dict) -> dict:
    if _blocked(state):
        return {}
    raw = complete_json(
        SYSTEM_PROMPT,
        "Review the incident and list only observations and contributing factors supported by the text. "
        "Return JSON with investigation_observations (string), contributing_factors (array of strings), "
        "and analysis_summary (string). Do not name a confirmed root cause.\n"
        f"Input:\n{_context(state)}",
    )
    incident = dict(state.get("incident") or {})
    observations = raw.get("investigation_observations")
    if observations:
        incident["investigation_observations"] = observations
    factors = raw.get("contributing_factors")
    if isinstance(factors, list):
        incident["contributing_factors"] = factors
    return {"incident": normalize_incident(incident)}


def perform_rca(state: dict) -> dict:
    if _blocked(state):
        return {}
    method = state.get("methodology") or "5_whys"
    stop = state.get("stop_after") or "full"
    if stop == "fishbone":
        method = "fishbone"
    elif stop == "five_whys":
        method = "5_whys"

    if method == "fishbone":
        raw = complete_json(
            SYSTEM_PROMPT,
            "Build a Fishbone diagram using only supported or clearly labeled possible causes. "
            "Categories must be manpower, machine, method, material, measurement, and environment. "
            "Each item is {cause, evidence}. Leave a category empty if the text does not support it. "
            "Return JSON with a fishbone object.\n"
            f"Input:\n{_context(state)}",
        )
        return {"methodology": "fishbone", "fishbone": normalize_fishbone(raw)}

    raw = complete_json(
        SYSTEM_PROMPT,
        "Produce a 5 Whys sequence. Ask the next why only when the current answer is supported. "
        "Stop early if evidence runs out. Do not invent answers to reach five steps. "
        "Each step is {why_question, answer, evidence, evidence_needed}. "
        "If the answer is not supported, set answer to Requires Investigation. "
        "Return JSON with a five_whys array.\n"
        f"Input:\n{_context(state)}",
    )
    return {"methodology": "5_whys", "five_whys": normalize_five_whys(raw)}


def identify_root_causes(state: dict) -> dict:
    if _blocked(state):
        return {}
    raw = complete_json(
        SYSTEM_PROMPT,
        "Identify potential root causes. Each item must include description, reasoning, "
        "supporting_evidence, confidence (Low, Medium, or High), evidence_strength "
        "(AI Hypothesis or Evidence-Supported), and missing_information. "
        "Use AI Hypothesis when evidence is missing or only a suspicion is stated. "
        "Never use Human-Confirmed. Do not treat a suspected cooling failure as confirmed. "
        "Return JSON with potential_root_causes.\n"
        f"Input:\n{_context(state)}",
    )
    return {"potential_root_causes": normalize_causes(raw)}


def identify_missing_evidence(state: dict) -> dict:
    if _blocked(state):
        return {}
    raw = complete_json(
        SYSTEM_PROMPT,
        "Suggest additional information that would help the investigation. These are suggestions only. "
        "Do not imply the records exist or were reviewed. Consider, only when relevant, equipment "
        "maintenance history, operator training records, batch manufacturing records, calibration records, "
        "temperature monitoring logs, previous deviation records, SOPs, and environmental monitoring. "
        "Each item is {item, category, rationale, required}. Return JSON with missing_evidence.\n"
        f"Input:\n{_context(state)}",
    )
    return {"missing_evidence": normalize_missing(raw)}


def generate_capa(state: dict) -> dict:
    if _blocked(state):
        return {}
    raw = complete_json(
        SYSTEM_PROMPT,
        "Recommend separate Corrective and Preventive actions. Do not approve or close them. "
        "Each item includes action_type (Corrective or Preventive), action_description, justification, "
        "responsible_role, priority (Critical, High, Medium, or Low), and effectiveness_verification. "
        "Tie each action to supplied facts or clearly label it as dependent on missing evidence. "
        "Return JSON with capa_actions. Include at least one corrective and one preventive suggestion "
        "when the incident text supports doing so.\n"
        f"Input:\n{_context(state)}",
    )
    return {"capa_actions": normalize_capa(raw)}


def validate_output(state: dict) -> dict:
    causes = normalize_causes(state.get("potential_root_causes") or [])
    for cause in causes:
        cause["is_confirmed"] = False
    return {
        "incident": normalize_incident(state.get("incident") or {}),
        "five_whys": normalize_five_whys(state.get("five_whys") or []),
        "fishbone": normalize_fishbone(state.get("fishbone") or {}),
        "potential_root_causes": causes,
        "missing_evidence": normalize_missing(state.get("missing_evidence") or []),
        "capa_actions": normalize_capa(state.get("capa_actions") or []),
        "validated": not state.get("errors"),
    }


def _route_after_incident(state: dict) -> str:
    if state.get("errors"):
        return "validate_output"
    stop = state.get("stop_after") or "full"
    return {
        "extract": "validate_output",
        "five_whys": "perform_rca",
        "fishbone": "perform_rca",
        "root_causes": "identify_root_causes",
        "missing_evidence": "identify_missing_evidence",
        "capa": "generate_capa",
    }.get(stop, "analyze_investigation")


def _route_after_rca(state: dict) -> str:
    if state.get("errors"):
        return "validate_output"
    stop = state.get("stop_after") or "full"
    if stop in {"five_whys", "fishbone"}:
        return "validate_output"
    return "identify_root_causes"


def _route_after_causes(state: dict) -> str:
    if state.get("errors"):
        return "validate_output"
    if (state.get("stop_after") or "full") == "root_causes":
        return "validate_output"
    return "identify_missing_evidence"


def _route_after_missing(state: dict) -> str:
    if state.get("errors"):
        return "validate_output"
    if (state.get("stop_after") or "full") == "missing_evidence":
        return "validate_output"
    return "generate_capa"


def build_rca_graph():
    graph = StateGraph(RCAState)
    graph.add_node("extract_content", extract_content)
    graph.add_node("extract_incident", extract_incident)
    graph.add_node("analyze_investigation", analyze_investigation)
    graph.add_node("perform_rca", perform_rca)
    graph.add_node("identify_root_causes", identify_root_causes)
    graph.add_node("identify_missing_evidence", identify_missing_evidence)
    graph.add_node("generate_capa", generate_capa)
    graph.add_node("validate_output", validate_output)

    graph.set_entry_point("extract_content")
    graph.add_edge("extract_content", "extract_incident")
    graph.add_conditional_edges(
        "extract_incident",
        _route_after_incident,
        {
            "validate_output": "validate_output",
            "perform_rca": "perform_rca",
            "identify_root_causes": "identify_root_causes",
            "identify_missing_evidence": "identify_missing_evidence",
            "generate_capa": "generate_capa",
            "analyze_investigation": "analyze_investigation",
        },
    )
    graph.add_edge("analyze_investigation", "perform_rca")
    graph.add_conditional_edges(
        "perform_rca",
        _route_after_rca,
        {"validate_output": "validate_output", "identify_root_causes": "identify_root_causes"},
    )
    graph.add_conditional_edges(
        "identify_root_causes",
        _route_after_causes,
        {"validate_output": "validate_output", "identify_missing_evidence": "identify_missing_evidence"},
    )
    graph.add_conditional_edges(
        "identify_missing_evidence",
        _route_after_missing,
        {"validate_output": "validate_output", "generate_capa": "generate_capa"},
    )
    graph.add_edge("generate_capa", "validate_output")
    graph.add_edge("validate_output", END)
    return graph.compile()


_COMPILED = None


def get_rca_graph():
    global _COMPILED
    if _COMPILED is None:
        _COMPILED = build_rca_graph()
    return _COMPILED


def sections_for(stop_after: str | None) -> list[str]:
    stop = stop_after or "full"
    mapping = {
        "extract": ["incident"],
        "five_whys": ["five_whys"],
        "fishbone": ["fishbone"],
        "root_causes": ["potential_root_causes"],
        "missing_evidence": ["missing_evidence"],
        "capa": ["capa_actions"],
        "full": [
            "incident",
            "five_whys",
            "fishbone",
            "potential_root_causes",
            "missing_evidence",
            "capa_actions",
        ],
    }
    return mapping.get(stop, ["incident"])


def run_workflow(payload: dict) -> dict:
    stop_after = payload.get("stop_after") or "full"
    methodology = payload.get("methodology") or "5_whys"
    if stop_after == "fishbone":
        methodology = "fishbone"
    elif stop_after == "five_whys":
        methodology = "5_whys"

    initial = {
        "content": payload.get("content") or "",
        "source_type": payload.get("source_type") or "text",
        "methodology": methodology,
        "stop_after": stop_after,
        "incident": payload.get("incident") or {},
        "five_whys": payload.get("five_whys") or [],
        "fishbone": payload.get("fishbone") or {},
        "potential_root_causes": payload.get("potential_root_causes") or [],
        "missing_evidence": payload.get("missing_evidence") or [],
        "capa_actions": payload.get("capa_actions") or [],
        "errors": [],
        "validated": False,
    }
    final = get_rca_graph().invoke(initial)
    errors = [str(item) for item in (final.get("errors") or []) if item]
    if errors:
        from app.services.ai.groq_client import AIWorkflowError

        raise AIWorkflowError(" ".join(errors))

    sections = sections_for(stop_after)
    result = {
        "updated_sections": sections,
        "notice": NOTICE,
        "methodology": final.get("methodology") or methodology,
        "validated": bool(final.get("validated")),
    }
    for key in sections:
        result[key] = final.get(key)
    return result
