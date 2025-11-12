"""
Endpoints для работы с жанрами
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.genre import Genre
from app.crud.genre import crud_genre

router = APIRouter()

@router.get("", response_model=List[Genre])
async def get_genres(
    db: AsyncSession = Depends(get_db)
):
    """Получить все активные жанры"""
    return await crud_genre.get_all(db)