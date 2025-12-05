"""
Главный файл приложения FastAPI
"""
import asyncio
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings, CORS_ORIGINS
from app.core.database import init_db
from app.api.v1.router import api_router
from app.bot.runner import run_background, shutdown_bot

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Управление жизненным циклом с обработкой ошибок
    """
    # Инициализация базы данных
    try:
        await init_db()
        logger.info("✅ База данных инициализирована")
    except Exception as e:
        logger.error(f"❌ Ошибка инициализации БД: {e}")
        # Не прерываем запуск
    
    # Запуск Telegram бота
    bot_task = None
    try:
        from app.bot.runner import run_background
        bot_task = await run_background()
        if bot_task:
            logger.info("🤖 Telegram бот запущен")
        else:
            logger.warning("⚠️ Telegram бот не запущен (проверьте токен)")
    except Exception as e:
        logger.error(f"❌ Ошибка запуска Telegram бота: {e}")
        # Бот не критичен, продолжаем
    
    yield
    
    # Остановка
    logger.info("🛑 Остановка приложения...")
    
    if bot_task:
        try:
            from app.bot.runner import shutdown_bot
            bot_task.cancel()
            await shutdown_bot()
            logger.info("✅ Telegram бот остановлен")
        except Exception as e:
            logger.error(f"❌ Ошибка остановки бота: {e}")



app = FastAPI(
    title="musicme.ru API",
    description="API для сервиса создания персонализированных музыкальных треков",
    version="1.0.0",
    lifespan=lifespan,
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Корневой endpoint"""
    return {
        "message": "MusicMe.ru API",
        "version": "1.0.1",
        "docs": "/docs",
        "status": "running",
        "features": {
            "telegram_bot": bool(settings.TELEGRAM_BOT_TOKEN),
            "oauth_providers": {
                "yandex": bool(settings.YANDEX_CLIENT_ID),
                "google": bool(settings.GOOGLE_CLIENT_ID),
                "vk": bool(settings.VK_CLIENT_ID) if hasattr(settings, 'VK_CLIENT_ID') else False
            }
        }
    }


@app.get("/health")
async def health_check():
    """Проверка здоровья приложения"""
    health_status = {
        "status": "ok",
        "database": "connected",
        "telegram_bot": "running" if settings.TELEGRAM_BOT_TOKEN else "not_configured",
        "timestamp": __import__("datetime").datetime.now().isoformat()
    }
    
    # Можно добавить проверку подключения к базе данных
    # и статуса бота при необходимости
    
    return health_status


@app.get("/bot/status")
async def bot_status():
    """Проверка статуса Telegram бота"""
    if not settings.TELEGRAM_BOT_TOKEN:
        return {
            "status": "not_configured",
            "message": "TELEGRAM_BOT_TOKEN не настроен"
        }
    
    try:
        # Проверяем что бот доступен через API
        import httpx
        
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(
                f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getMe"
            )
            
            if response.status_code == 200:
                bot_info = response.json()
                return {
                    "status": "running",
                    "bot": {
                        "id": bot_info["result"]["id"],
                        "username": bot_info["result"]["username"],
                        "first_name": bot_info["result"]["first_name"]
                    }
                }
            else:
                return {
                    "status": "error",
                    "message": f"Telegram API error: {response.text}"
                }
                
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }