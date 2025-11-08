"""
Главный файл приложения FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Инициализация при запуске и очистка при остановке"""
    # Инициализация базы данных
    await init_db()
    yield
    # Очистка при остановке (если нужно)


app = FastAPI(
    title="Mysong-Podarok.ru API",
    description="API для сервиса создания персонализированных музыкальных треков",
    version="1.0.0",
    lifespan=lifespan,
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
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
        "message": "Mysong-Podarok.ru API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Проверка здоровья приложения"""
    return {"status": "ok"}

