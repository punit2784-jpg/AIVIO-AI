from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class InvestigationBase(BaseModel):
    investigation_code: str = Field(..., json_schema_extra={"example": "RCA-2026-001"})
    incident_title: str = Field(..., json_schema_extra={"example": "Unexpected Temperature Excursion During API Manufacturing"})
    incident_description: str = Field(..., json_schema_extra={"example": "Reactor temperature exceeded established operating limit..."})
    incident_date: Optional[datetime] = None
    department: Optional[str] = "Production"
    product_name: Optional[str] = "API Batch – API-2026-001"
    batch_number: Optional[str] = "API-2026-001"
    equipment: Optional[str] = "Reactor R-101"
    immediate_actions: Optional[str] = "Batch placed on hold pending investigation."
    investigation_status: str = "Open"

class InvestigationCreate(InvestigationBase):
    pass

class InvestigationResponse(InvestigationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InvestigationListResponse(BaseModel):
    total: int
    items: List[InvestigationResponse]
