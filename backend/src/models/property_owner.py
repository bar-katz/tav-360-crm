"""
PropertyOwner model
"""
from sqlalchemy import Column, Integer, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from src.database import Base

class PropertyOwner(Base):
    __tablename__ = "property_owners"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    ownership_percentage = Column(Numeric(5, 2))
    notes = Column(Text)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<PropertyOwner {self.id}>"

