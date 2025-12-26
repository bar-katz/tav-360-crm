"""
Property model
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from src.database import Base

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    category = Column(String)  # מגורים, משרדים
    property_type = Column(String)  # דירה, בית, etc.
    city = Column(String)
    area = Column(String)
    street = Column(String)
    building_number = Column(String)
    apartment_number = Column(String)
    price = Column(Numeric)
    rooms = Column(Integer)
    floor = Column(Integer)
    total_floors = Column(Integer)
    parking = Column(Boolean, default=False)
    air_conditioning = Column(Boolean, default=False)
    storage = Column(Boolean, default=False)
    status = Column(String)
    listing_type = Column(String)  # מכירה, השכרה
    handler = Column(String)
    source = Column(String)
    image_urls = Column(ARRAY(String))
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Property {self.id}>"

