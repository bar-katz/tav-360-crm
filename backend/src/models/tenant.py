"""
Tenant model
"""
from sqlalchemy import Column, Integer, Numeric, Text, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from src.database import Base

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    lease_start_date = Column(Date)
    lease_end_date = Column(Date)
    monthly_rent = Column(Numeric(15, 2))
    deposit = Column(Numeric(15, 2))
    notes = Column(Text)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Tenant {self.id}>"

