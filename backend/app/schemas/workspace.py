from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class WorkspaceIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    investigation_code: Optional[str] = None
    incident_title: str = Field(min_length=1)
    incident_description: Optional[str] = ""
    incident_date: Optional[Any] = None
    department: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    equipment: Optional[str] = None
    immediate_actions: Optional[str] = None
    investigation_status: Optional[str] = "Open"
    severity: Optional[str] = None
    methodology: Optional[str] = "5_whys"
    five_whys: Optional[list] = None
    fishbone: Optional[dict] = None
    potential_root_causes: Optional[list] = None
    confirmed_root_cause: Optional[str] = ""
    investigation_conclusion: Optional[str] = ""
    missing_evidence: Optional[list] = None
    capa_actions: Optional[list] = None
    source_input: Optional[dict] = None
    manufacturing_process: Optional[str] = None
    observed_abnormality: Optional[str] = None
    investigation_observations: Optional[str] = None
    contributing_factors: Optional[Any] = None


class InvestigationSummary(BaseModel):
    id: int
    investigation_code: str
    incident_title: str
    incident_description: str
    incident_date: Optional[datetime] = None
    department: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    equipment: Optional[str] = None
    immediate_actions: Optional[str] = None
    investigation_status: str
    severity: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class WorkspaceOut(WorkspaceIn):
    id: int
    investigation_code: str
    incident_title: str
    capa_actions: list = []
    evidence_items: list = []
    five_whys: list = []
    fishbone: dict = {}
    potential_root_causes: list = []
    missing_evidence: list = []
    created_at: datetime
    updated_at: datetime


class AIRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    content: str = ""
    source_type: str = "text"
    methodology: str = "5_whys"
    stop_after: Optional[str] = None
    incident: Optional[dict] = None
    five_whys: Optional[list] = None
    fishbone: Optional[dict] = None
    potential_root_causes: Optional[list] = None
    missing_evidence: Optional[list] = None
    capa_actions: Optional[list] = None
