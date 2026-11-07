import fitz
import pytest
from app.services.ai.graph import build_rca_graph, run_workflow
from app.services.ai.normalize import normalize_capa, normalize_causes, normalize_five_whys
from app.services.documents import extract_pdf_bytes

SECTION_14 = (
    "Incident title: Unexpected Temperature Excursion During API Manufacturing. "
    "Department: Production. Product: API Batch – API-2026-001. "
    "During manufacturing, the reactor temperature exceeded the established operating limit. "
    "The operator observed the abnormal temperature reading and immediately informed the production supervisor. "
    "The batch was placed on hold pending investigation. Cooling system performance is suspected. "
    "Equipment maintenance history is not yet available."
)


def test_pdf_text_extraction():
    document = fitz.open()
    page = document.new_page()
    page.insert_text((72, 72), "Reactor temperature exceeded the operating limit. Batch API-2026-001 was placed on hold.")
    payload = document.tobytes()
    document.close()

    parsed = extract_pdf_bytes(payload, "deviation.pdf")
    assert parsed["page_count"] == 1
    assert "API-2026-001" in parsed["text"]


def test_pdf_rejects_non_pdf_name():
    with pytest.raises(ValueError):
        extract_pdf_bytes(b"hello", "notes.txt")


def test_graph_contains_required_nodes():
    graph = build_rca_graph()
    node_names = set(graph.get_graph().nodes.keys())
    for name in [
        "extract_content",
        "extract_incident",
        "analyze_investigation",
        "perform_rca",
        "identify_root_causes",
        "identify_missing_evidence",
        "generate_capa",
        "validate_output",
    ]:
        assert name in node_names


def test_normalize_never_confirms_ai_cause():
    causes = normalize_causes([
        {
            "description": "Cooling system failed",
            "reasoning": "The text only says performance is suspected.",
            "supporting_evidence": "Not Provided",
            "confidence": "High",
            "evidence_strength": "Human-Confirmed",
            "is_confirmed": True,
        }
    ])
    assert causes[0]["is_confirmed"] is False
    assert causes[0]["evidence_strength"] == "AI Hypothesis"
    assert causes[0]["confidence"] == "Low"


def test_normalize_capa_stays_proposed():
    actions = normalize_capa([
        {
            "action_type": "preventive action",
            "action_description": "Review the maintenance schedule.",
            "justification": "History was not available.",
            "priority": "High",
            "status": "Closed",
        }
    ])
    assert actions[0]["action_type"] == "Preventive"
    assert actions[0]["status"] == "Proposed"


def test_five_whys_do_not_pad_missing_steps():
    steps = normalize_five_whys([
        {
            "why_question": "Why did the temperature exceed the limit?",
            "answer": "Requires Investigation",
            "evidence": "Not Provided",
            "evidence_needed": "Equipment maintenance history",
        }
    ])
    assert len(steps) == 1
    assert steps[0]["answer"] == "Requires Investigation"


def test_extract_workflow_with_stubbed_model(monkeypatch):
    def fake_complete(system_prompt, user_prompt):
        assert "JSON" in system_prompt or "JSON" in user_prompt or True
        return {
            "incident": {
                "incident_title": "Unexpected Temperature Excursion During API Manufacturing",
                "incident_description": "The reactor temperature exceeded the operating limit and the batch was placed on hold.",
                "department": "Production",
                "product_name": "API Batch – API-2026-001",
                "batch_number": "API-2026-001",
                "equipment": "Not Provided",
                "immediate_actions": "The batch was placed on hold and the supervisor was informed.",
                "incident_date": "Not Provided",
            }
        }

    monkeypatch.setattr("app.services.ai.graph.complete_json", fake_complete)
    result = run_workflow({"content": SECTION_14, "source_type": "text", "stop_after": "extract"})
    assert result["updated_sections"] == ["incident"]
    assert result["incident"]["batch_number"] == "API-2026-001"
    assert result["incident"]["incident_date"] is None
    assert "not a confirmed root cause" in result["notice"].lower()


def test_five_whys_skips_extraction_when_incident_exists(monkeypatch):
    calls = {"count": 0}

    def fake_complete(system_prompt, user_prompt):
        calls["count"] += 1
        return {
            "five_whys": [
                {
                    "why_question": "Why did the reactor temperature exceed the operating limit?",
                    "answer": "Requires Investigation",
                    "evidence": "Not Provided",
                    "evidence_needed": "Cooling system maintenance history",
                }
            ]
        }

    monkeypatch.setattr("app.services.ai.graph.complete_json", fake_complete)
    result = run_workflow(
        {
            "content": SECTION_14,
            "source_type": "text",
            "stop_after": "five_whys",
            "incident": {
                "incident_title": "Unexpected Temperature Excursion During API Manufacturing",
                "incident_description": "Temperature exceeded the limit and the batch is on hold.",
                "department": "Production",
            },
        }
    )
    assert calls["count"] == 1
    assert len(result["five_whys"]) == 1
    assert result["five_whys"][0]["evidence_needed"] == "Cooling system maintenance history"
