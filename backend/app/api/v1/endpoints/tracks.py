"""
Endpoints для работы с треками
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.track import Track

router = APIRouter()


@router.get("/{track_id}", response_model=Track)
async def get_track(
    track_id: UUID,
    db: AsyncSession = Depends(get_db),
    # TODO: Добавить зависимость для получения текущего пользователя
):
    """
    Получить информацию о треке
    """
    # TODO: Реализовать получение трека с проверкой прав доступа
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Получение трека еще не реализовано"
    )

