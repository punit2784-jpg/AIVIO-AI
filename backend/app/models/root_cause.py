from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class RootCauseAnalysis(Base):
    __tablename__ = "root_cause_analyses"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    methodology = Column(String(64), nullable=False)  # 5_whys or fishbone
    analysis_data = Column(JSON, nullable=True)        # Structured JSON for whys or 6M fishbone
    potential_root_causes = Column(JSON, nullable=True)# List of candidate causes with confidence/evidence
    confirmed_root_cause = Column(Text, nullable=True) # Human investigator confirmed root cause
    investigation_conclusion = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    investigation = relationship("Investigation", back_populates="rca_records")

    def __repr__(self):
        return f"<RootCauseAnalysis {self.id} ({self.methodology}) for Inv {self.investigation_id}>"

