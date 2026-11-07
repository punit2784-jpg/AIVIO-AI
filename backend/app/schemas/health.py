from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = Field(..., description="Overall service status (healthy/degraded)")
    service: str = Field(default="AIVOA.AI RCA Backend API")
    version: str = Field(default="1.0.0")
    environment: str = Field(default="development")
    python_version: str = Field(default="3.12.10")
    database: Dict[str, Any] = Field(..., description="Database connectivity details")
    groq_configured: bool = False
    groq_model: str = ""
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp")

class SystemInfoResponse(BaseModel):
    project_name: str
    version: str
    phase: str
    supported_models: list[str]
    storage: Dict[str, Any]

