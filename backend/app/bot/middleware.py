"""
Middleware для Telegram бота
"""
import logging
from typing import Callable, Dict, Any, Awaitable
from aiogram import BaseMiddleware
from aiogram.types import Message, TelegramObject
from aiogram import Dispatcher

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseMiddleware):
    """Middleware для логирования"""
    
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        if isinstance(event, Message):
            user = event.from_user
            logger.info(
                f"Telegram command from @{user.username} ({user.id}): {event.text}"
            )
        
        return await handler(event, data)


class UserMiddleware(BaseMiddleware):
    """Middleware для работы с пользователями"""
    
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        if isinstance(event, Message):
            # Можно добавить проверку пользователя в БД
            # или кэширование данных пользователя
            pass
        
        return await handler(event, data)


async def register_middleware(dp: Dispatcher):
    """Регистрация middleware"""
    dp.update.middleware(LoggingMiddleware())
    dp.update.middleware(UserMiddleware())
    
    logger.info("Middleware Telegram бота зарегистрированы")