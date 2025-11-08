"""
Административные endpoints
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.order import AdminOrder
from app.schemas.track import TrackCreate, Track

router = APIRouter()


@router.get("/orders", response_model=dict)
async def get_admin_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    # TODO: Добавить проверку прав администратора
):
    """
    Получить список всех заказов (только для администраторов)
    """
    # TODO: Реализовать получение всех заказов с фильтрацией
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Административные функции еще не реализованы"
    )


@router.post("/orders/{order_id}/tracks", response_model=Track, status_code=status.HTTP_201_CREATED)
async def create_track_for_order(
    order_id: UUID,
    track_data: TrackCreate,
    db: AsyncSession = Depends(get_db),
    # TODO: Добавить проверку прав администратора
):
    """
    Добавить трек к заказу (только для администраторов)
    """
    # TODO: Реализовать добавление трека к заказу
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Добавление треков еще не реализовано"
    )

