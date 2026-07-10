import os
# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings

# Load .env file manually if python-dotenv is not installed
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key, val = line.strip().split('=', 1)
                os.environ[key.strip()] = val.strip()

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Pulse Team Dashboard"
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg://neondb_owner:npg_SZke9pKUdr1y@ep-lively-surf-aodycewk-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")
    
    # JWT Auth Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "SUPER_SECRET_KEY_FOR_SISENCO_ASSIGNMENT_1234567890")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 
    # LLM Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

settings = Settings()