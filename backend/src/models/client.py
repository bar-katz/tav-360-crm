"""
Client model
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, Boolean, ForeignKey
from sqlalchemy.sql import func
from src.database import Base

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    request_type = Column(String)  # קנייה, השכרה
    preferred_property_type = Column(String)
    budget = Column(Numeric)
    preferred_rooms = Column(String)
    city = Column(String)
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
        return f"<Client {self.id}>"

