"""
Authentication schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    app_role: str
    
    class Config:
        from_attributes = True

