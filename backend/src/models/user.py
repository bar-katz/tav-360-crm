"""
User model for authentication
"""
from sqlalchemy import Column, Integer, String, Enum
from src.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    OFFICE_MANAGER = "office_manager"
    AGENT = "agent"
    PROPERTY_MANAGER = "property_manager"
    PROJECT_MANAGER = "project_manager"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String)
    app_role = Column(Enum(UserRole, native_enum=False, values_callable=lambda x: [e.value for e in x]), default=UserRole.AGENT)
    
    def __repr__(self):
        return f"<User {self.email}>"

