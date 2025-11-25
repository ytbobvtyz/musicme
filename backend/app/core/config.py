from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Яндекс OAuth
    YANDEX_CLIENT_ID: str = "not-set"
    YANDEX_CLIENT_SECRET: str = "not-set"
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str
    
    # Debug mode
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"
        extra = "ignore"

# CORS выносим в отдельную переменную (не часть настроек)
CORS_ORIGINS = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "http://localhost:5173",
    "http://193.108.115.232",
    "https://musicme.ru",
    "http://musicme.ru"
]

settings = Settings()