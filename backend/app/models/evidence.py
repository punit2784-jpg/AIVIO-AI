from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class InvestigationEvidence(Base):
    __tablename__ = "investigation_evidence"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    evidence_name = Column(String(255), nullable=False)
    evidence_description = Column(Text, nullable=True)
    evidence_type = Column(String(64), nullable=False)  # pdf, text, email, log
    evidence_status = Column(String(64), default="Collected")
    file_path = Column(String(512), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    investigation = relationship("Investigation", back_populates="evidence_items")

    def __repr__(self):
        return f"<InvestigationEvidence {self.id} - {self.evidence_name}>"

