"""
Configuration settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=True)
    
    DATABASE_URL: str = "postgresql://tav360:tav360secret@db:5432/tav360_crm"
    JWT_SECRET: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:80,http://localhost"
    # Backend base URL for generating file URLs (used in upload responses)
    BACKEND_BASE_URL: str = "http://localhost:8000"
    # PostgREST URL for proxying entity requests
    POSTGREST_URL: str = "http://postgrest:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

settings = Settings()

