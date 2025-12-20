"""
MarketingLog model
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from src.database import Base

class MarketingLog(Base):
    __tablename__ = "marketing_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("marketing_leads.id"), nullable=True)
    phone_number = Column(String)
    message_sent = Column(Text)
    status = Column(String, default='sent')  # sent, failed, pending
    sent_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<MarketingLog {self.id}>"

