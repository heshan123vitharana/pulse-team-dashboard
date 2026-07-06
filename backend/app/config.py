import os
# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Pulse Team Dashboard"
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/pulse_db")
    
    # JWT Auth Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "SUPER_SECRET_KEY_FOR_SISENCO_ASSIGNMENT_1234567890")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 

settings = Settings()