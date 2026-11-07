import pytest
import httpx
from app.main import app

SAMPLE = {
    "incident_title": "Unexpected Temperature Excursion During API Manufacturing",
    "incident_description": "The reactor temperature exceeded the operating limit. The batch was placed on hold.",
    "department": "Production",
    "product_name": "API Batch – API-2026-001",
    "batch_number": "API-2026-001",
    "equipment": "Reactor R-101",
    "immediate_actions": "Batch placed on hold. Supervisor notified.",
    "investigation_status": "Open",
    "methodology": "5_whys",
    "five_whys": [
        {
            "id": 1,
            "why_question": "Why did the temperature exceed the limit?",
            "answer": "Requires Investigation",
            "evidence": "Not Provided",
            "evidence_needed": "Maintenance history",
        }
    ],
    "confirmed_root_cause": "",
    "capa_actions": [
        {
            "action_type": "Corrective",
            "action_description": "Hold the batch pending evidence review.",
            "justification": "The temperature excursion is documented but the cause is not confirmed.",
            "responsible_role": "Quality Assurance",
            "priority": "High",
            "effectiveness_verification": "Confirm batch hold status in the record.",
            "status": "Proposed",
        }
    ],
    "source_input": {"type": "text", "fileName": "", "rawContent": "Reactor temperature exceeded the limit."},
}


@pytest.mark.anyio
async def test_investigation_crud_round_trip():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        created = await client.post("/api/investigations", json=SAMPLE)
        assert created.status_code == 200, created.text
        body = created.json()
        assert body["investigation_code"].startswith("RCA-")
        assert body["five_whys"][0]["answer"] == "Requires Investigation"
        assert body["capa_actions"][0]["status"] == "Proposed"
        investigation_id = body["id"]

        listed = await client.get("/api/investigations")
        assert listed.status_code == 200
        assert any(item["id"] == investigation_id for item in listed.json())

        fetched = await client.get(f"/api/investigations/{investigation_id}")
        assert fetched.status_code == 200
        assert fetched.json()["batch_number"] == "API-2026-001"

        updated = await client.put(
            f"/api/investigations/{investigation_id}",
            json={**SAMPLE, "investigation_status": "Under Review", "confirmed_root_cause": "Investigator has not confirmed a root cause."},
        )
        assert updated.status_code == 200
        assert updated.json()["investigation_status"] == "Under Review"
        assert updated.json()["confirmed_root_cause"] == "Investigator has not confirmed a root cause."

        removed = await client.delete(f"/api/investigations/{investigation_id}")
        assert removed.status_code == 204
        missing = await client.get(f"/api/investigations/{investigation_id}")
        assert missing.status_code == 404


@pytest.mark.anyio
async def test_ai_extract_reports_missing_key(monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "GROQ_API_KEY", "")
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/ai/extract",
            json={"content": SAMPLE["incident_description"] + " Department Production.", "source_type": "text"},
        )
        assert response.status_code == 503
        assert "GROQ_API_KEY" in response.json()["detail"]


@pytest.mark.anyio
async def test_short_input_is_rejected(monkeypatch):
    from app.services.ai import graph as graph_module

    monkeypatch.setattr(graph_module, "complete_json", lambda *_args, **_kwargs: {})
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post("/api/ai/extract", json={"content": "too short", "source_type": "text"})
        assert response.status_code == 422
