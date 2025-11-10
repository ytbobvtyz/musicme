from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Яндекс OAuth
    YANDEX_CLIENT_ID: str
    YANDEX_CLIENT_SECRET: str
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Debug mode
    DEBUG: bool = False  # ⬅️ ДОБАВЬ ЭТУ СТРОКУ
    
    class Config:
        env_file = ".env"

settings = Settings()