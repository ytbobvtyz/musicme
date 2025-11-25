"""
Главный файл приложения FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings, CORS_ORIGINS
from app.core.database import init_db
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Инициализация при запуске и очистка при остановке"""
    # Инициализация базы данных
    await init_db()
    print("✅ Таблицы базы данных созданы")
    
    # Здесь можно добавить вызов скрипта заполнения начальными данными
    # Но лучше делать это через отдельный скрипт в docker-compose
    yield
    
    # Очистка при остановке (если нужно)
    print("🛑 Приложение останавливается...")


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
        "message": "MusicMe.ru",
        "version": "1.0.1",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Проверка здоровья приложения"""
    return {"status": "ok"}