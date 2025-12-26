"""
ServiceCall model
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum, Date, Numeric
from sqlalchemy.sql import func
from src.database import Base
import enum

class ServiceCallStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class ServiceCall(Base):
    __tablename__ = "service_calls"
    
    id = Column(Integer, primary_key=True, index=True)
    call_number = Column(String(50), unique=True, nullable=False)
    handler = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="קריאה חדשה")  # Hebrew status values
    urgency = Column(String(50), default="בינונית")
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    total_cost = Column(Numeric(10, 2))
    work_date = Column(Date)
    notes = Column(Text)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<ServiceCall {self.call_number}>"

