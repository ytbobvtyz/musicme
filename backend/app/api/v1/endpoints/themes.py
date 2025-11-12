"""
Endpoints для работы с темами
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.theme import Theme
from app.crud.theme import crud_theme

router = APIRouter()

@router.get("", response_model=List[Theme])
async def get_themes(
    db: AsyncSession = Depends(get_db)
):
    """Получить все активные темы"""
    return await crud_theme.get_all(db)