"""
ServiceCall model
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
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
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(ServiceCallStatus), default=ServiceCallStatus.OPEN)
    property_id = Column(Integer, ForeignKey("properties.id"))
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<ServiceCall {self.title}>"

