"""
AccountingDocuments model
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, Date, ForeignKey
from sqlalchemy.sql import func
from src.database import Base

class AccountingDocument(Base):
    __tablename__ = "accounting_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String(50))  # invoice, receipt, contract, etc.
    document_number = Column(String(100))
    amount = Column(Numeric(15, 2))
    date = Column(Date)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    file_url = Column(String(500))
    notes = Column(Text)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<AccountingDocument {self.id}>"

