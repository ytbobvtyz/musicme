# app/bot/config.py
"""
Простая конфигурация бота
"""
from app.core.config import settings


class BotConfig:
    """Конфигурация бота без pydantic"""
    
    def __init__(self):
        self.token = settings.TELEGRAM_BOT_TOKEN
        self.username = settings.TELEGRAM_BOT_USERNAME
        self.name = settings.TELEGRAM_BOT_NAME
        self.mode = getattr(settings, 'TELEGRAM_BOT_MODE', 'background')
        self.admin_chat_id = getattr(settings, 'TELEGRAM_ADMIN_CHAT_ID', None)


def get_bot_config() -> BotConfig:
    """Получить конфигурацию бота"""
    return BotConfig()