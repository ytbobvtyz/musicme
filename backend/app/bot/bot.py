# app/bot/bot.py
"""
Упрощенный класс Telegram бота
"""
import logging
from typing import Optional

# Импорты aiogram
try:
    from aiogram import Bot, Dispatcher
    from aiogram.enums import ParseMode
    from aiogram.fsm.storage.memory import MemoryStorage
    from aiogram.client.default import DefaultBotProperties
    AIOGRAM_AVAILABLE = True
except ImportError:
    AIOGRAM_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("aiogram не установлен, бот не будет работать")

from app.bot.config import get_bot_config
from app.bot.handlers import register_handlers
from app.bot.middleware import register_middleware

logger = logging.getLogger(__name__)


class MusicMeBot:
    """Класс Telegram бота MusicMe.ru"""
    
    def __init__(self):
        self.config = get_bot_config()
        self.bot: Optional[Bot] = None
        self.dp: Optional[Dispatcher] = None
        self.storage = MemoryStorage() if AIOGRAM_AVAILABLE else None
        
    async def initialize(self) -> bool:
        """Инициализация бота"""
        try:
            # Проверка зависимостей
            if not AIOGRAM_AVAILABLE:
                logger.error("aiogram не установлен")
                return False
            
            # Проверка токена
            if not self.config.token:
                logger.warning("TELEGRAM_BOT_TOKEN не настроен")
                return False
            
            # Инициализация бота
            self.bot = Bot(
                token=self.config.token,
                default=DefaultBotProperties(parse_mode=ParseMode.HTML)
            )
            
            # Инициализация диспетчера
            self.dp = Dispatcher(storage=self.storage)
            
            # Регистрация middleware и handlers
            if hasattr(register_middleware, '__call__'):
                await register_middleware(self.dp)
            
            if hasattr(register_handlers, '__call__'):
                await register_handlers(self.dp)
            
            logger.info(f"Telegram бот @{self.config.username} инициализирован")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка инициализации бота: {e}", exc_info=True)
            return False
    
    async def shutdown(self):
        """Завершение работы бота"""
        try:
            if self.bot and hasattr(self.bot, 'session'):
                await self.bot.session.close()
                logger.info("Telegram бот остановлен")
        except Exception as e:
            logger.error(f"Ошибка при остановке бота: {e}")
    
    def get_bot(self) -> Optional[Bot]:
        """Получить экземпляр бота"""
        return self.bot
    
    def get_config(self):
        """Получить конфигурацию"""
        return self.config
    
    async def send_message(self, chat_id: int, text: str, **kwargs) -> bool:
        """Отправить сообщение через бота"""
        if not self.bot:
            logger.error("Бот не инициализирован")
            return False
        
        try:
            await self.bot.send_message(chat_id=chat_id, text=text, **kwargs)
            return True
        except Exception as e:
            logger.error(f"Ошибка отправки сообщения: {e}")
            return False


# Глобальный экземпляр
_bot_instance = None


async def get_bot_instance():
    """Получить экземпляр бота"""
    global _bot_instance
    
    if _bot_instance is None:
        _bot_instance = MusicMeBot()
        if not await _bot_instance.initialize():
            _bot_instance = None
    
    return _bot_instance


async def shutdown_bot():
    """Завершение работы бота"""
    global _bot_instance
    
    if _bot_instance:
        await _bot_instance.shutdown()
        _bot_instance = None