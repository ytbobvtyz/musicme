"""
Запуск Telegram бота в разных режимах
"""
import asyncio
import logging
from contextlib import asynccontextmanager

from app.bot.bot import MusicMeBot, shutdown_bot
from app.bot.config import get_bot_config

logger = logging.getLogger(__name__)


async def start_polling():
    """Запуск бота в режиме polling"""
    bot = MusicMeBot()
    
    try:
        # Инициализация бота
        initialized = await bot.initialize()
        if not initialized:
            logger.error("Не удалось инициализировать бота")
            return
        
        config = bot.get_config()
        logger.info(f"Запуск Telegram бота в режиме polling...")
        
        # Запуск polling
        await bot.dp.start_polling(
            bot.bot,
            polling_timeout=config.polling_interval,
            skip_updates=True
        )
        
    except asyncio.CancelledError:
        logger.info("Polling остановлен по запросу")
    except Exception as e:
        logger.error(f"Ошибка в работе бота: {e}")
    finally:
        await bot.shutdown()


async def run_background():
    """Запуск бота в фоновом режиме (вместе с веб-сервером)"""
    bot = MusicMeBot()
    
    try:
        # Инициализация бота
        initialized = await bot.initialize()
        if not initialized:
            logger.error("Не удалось инициализировать бота")
            return None
        
        config = bot.get_config()
        logger.info(f"Запуск Telegram бота в фоновом режиме...")
        if not hasattr(config, 'polling_interval'):
            config.polling_interval = 1.0
        # Создаем фоновую задачу для polling
        polling_task = asyncio.create_task(
            bot.dp.start_polling(
                bot.bot,
                polling_timeout=config.polling_interval,
                skip_updates=True
            )
        )
        
        return polling_task
        
    except Exception as e:
        logger.error(f"Ошибка запуска бота в фоновом режиме: {e}")
        await bot.shutdown()
        return None


@asynccontextmanager
async def bot_lifespan():
    """
    Контекстный менеджер для управления жизненным циклом бота.
    Используется при интеграции с веб-сервером.
    """
    polling_task = None
    
    try:
        # Запуск бота в фоновом режиме
        polling_task = await run_background()
        yield
        
    finally:
        # Остановка бота
        if polling_task:
            polling_task.cancel()
            try:
                await polling_task
            except asyncio.CancelledError:
                pass
        
        await shutdown_bot()


def run_standalone():
    """Запуск бота как отдельного приложения"""
    async def main():
        await start_polling()
    
    asyncio.run(main())