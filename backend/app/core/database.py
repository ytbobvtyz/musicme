"""
Настройка подключения к базе данных
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# Создание асинхронного движка
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)

# Создание фабрики сессий
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Базовый класс для моделей
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    Dependency для получения сессии базы данных
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """
    Инициализация базы данных (создание таблиц)
    В production рекомендуется использовать Alembic миграции вместо create_all
    """
    # Импортируем все модели для регистрации в Base.metadata
    from app.models import user, order, track  # noqa
    
    async with engine.begin() as conn:
        # Создаем таблицы (только для разработки)
        # В production используйте: alembic upgrade head
        await conn.run_sync(Base.metadata.create_all)

