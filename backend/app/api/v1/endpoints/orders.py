"""
Endpoints для работы с заказами
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.schemas.order import Order, OrderCreate, OrderDetail
from app.models.order import Order as OrderModel

router = APIRouter()


@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    # TODO: Добавить зависимость для получения текущего пользователя
):
    """
    Создать новый заказ
    """
    # TODO: Получить текущего пользователя из JWT токена
    # user_id = current_user.id
    
    # Временная заглушка
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Создание заказа еще не реализовано"
    )


@router.get("", response_model=dict)
async def get_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    # TODO: Добавить зависимость для получения текущего пользователя
):
    """
    Получить список заказов пользователя
    """
    # TODO: Реализовать получение заказов текущего пользователя
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Получение заказов еще не реализовано"
    )


@router.get("/{order_id}", response_model=OrderDetail)
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    # TODO: Добавить зависимость для получения текущего пользователя
):
    """
    Получить детальную информацию о заказе
    """
    # TODO: Реализовать получение заказа с проверкой прав доступа
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Получение заказа еще не реализовано"
    )

