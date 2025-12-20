"""
DoNotCallList model
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from src.database import Base

class DoNotCallList(Base):
    __tablename__ = "do_not_call_list"
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(50), unique=True, nullable=False)
    reason = Column(Text)
    notes = Column(Text)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<DoNotCallList {self.id}>"

