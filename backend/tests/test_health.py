import pytest
import httpx
from app.main import app

@pytest.mark.anyio
async def test_root_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert data["version"] == "1.0.0"

@pytest.mark.anyio
async def test_health_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data
        assert "python_version" in data

@pytest.mark.anyio
async def test_system_info_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        response = await client.get("/api/system-info")
        assert response.status_code == 200
        data = response.json()
        assert "Phases 1–8" in data["phase"]
        assert "openai/gpt-oss-120b" in data["supported_models"]

@pytest.mark.anyio
async def test_investigations_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        response = await client.get("/api/investigations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
