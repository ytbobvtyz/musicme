from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    # Яндекс OAuth
    YANDEX_CLIENT_ID: str = "not-set"
    YANDEX_CLIENT_SECRET: str = "not-set"
    YANDEX_REDIRECT_URL: str = "https://musicme.ru/api/v1/auth/yandex/callback"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = "not-set"
    GOOGLE_CLIENT_SECRET: str = "not-set"
    GOOGLE_REDIRECT_URL: str = "https://musicme.ru/api/v1/auth/google/callback"
    
    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = Field(default="")
    TELEGRAM_BOT_USERNAME: str = Field(default="musicme_ru_bot")
    TELEGRAM_BOT_NAME: str = Field(default="MusicMe Bot")
    TELEGRAM_BOT_MODE: str = Field(default="background")  # background, standalone
    c: Optional[int] = Field(default=None)

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_URL: str = "https://musicme.ru"
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