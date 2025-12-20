"""
MarketingLead model
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, Boolean, ForeignKey
from sqlalchemy.sql import func
from src.database import Base

class MarketingLead(Base):
    __tablename__ = "marketing_leads"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    phone_number = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    budget = Column(Numeric(15, 2))
    neighborhood = Column(String)
    street = Column(String)
    rooms_min = Column(Integer)
    rooms_max = Column(Integer)
    client_type = Column(String)
    seriousness = Column(String)
    additional_notes = Column(Text)
    opt_out_whatsapp = Column(Boolean, default=False)
    source = Column(String)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<MarketingLead {self.id}>"

