from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class CapaAction(Base):
    __tablename__ = "capa_actions"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String(64), nullable=False)  # Corrective or Preventive
    action_description = Column(Text, nullable=False)
    justification = Column(Text, nullable=True)
    responsible_role = Column(String(128), nullable=True)
    priority = Column(String(64), default="Medium")   # Critical, High, Medium, Low
    effectiveness_verification = Column(Text, nullable=True)
    status = Column(String(64), default="Draft")       # Draft, Assigned, In_Progress, Verified, Closed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    investigation = relationship("Investigation", back_populates="capa_actions")

    def __repr__(self):
        return f"<CapaAction {self.id} ({self.action_type}) - {self.priority}>"

