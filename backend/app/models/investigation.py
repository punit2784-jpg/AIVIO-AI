from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    investigation_code = Column(String(64), unique=True, index=True, nullable=False)
    incident_title = Column(String(255), nullable=False)
    incident_description = Column(Text, nullable=False)
    incident_date = Column(DateTime, nullable=True)
    department = Column(String(128), nullable=True)
    product_name = Column(String(128), nullable=True)
    batch_number = Column(String(128), nullable=True)
    equipment = Column(String(128), nullable=True)
    immediate_actions = Column(Text, nullable=True)
    investigation_status = Column(String(64), default="Open", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    evidence_items = relationship("InvestigationEvidence", back_populates="investigation", cascade="all, delete-orphan")
    rca_records = relationship("RootCauseAnalysis", back_populates="investigation", cascade="all, delete-orphan")
    capa_actions = relationship("CapaAction", back_populates="investigation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Investigation {self.investigation_code} - {self.incident_title}>"

