"""
ProjectLead model
"""
from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from src.database import Base

class ProjectLead(Base):
    __tablename__ = "project_leads"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    interest_level = Column(String(50))
    budget = Column(Numeric(15, 2))
    preferred_units = Column(String(255))
    notes = Column(Text)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<ProjectLead {self.id}>"

