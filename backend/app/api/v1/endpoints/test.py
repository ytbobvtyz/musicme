from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.theme import Theme
from app.models.genre import Genre

router = APIRouter()

@router.get("/check-db")
async def check_db(db: AsyncSession = Depends(get_db)):
    """Проверка что БД работает и данные есть"""
    # Проверяем темы
    result = await db.execute(select(Theme))
    themes = result.scalars().all()
    
    # Проверяем жанры
    result = await db.execute(select(Genre))
    genres = result.scalars().all()
    
    return {
        "status": "ok",
        "themes_count": len(themes),
        "genres_count": len(genres),
        "themes": [t.name for t in themes],
        "genres": [g.name for g in genres]
    }