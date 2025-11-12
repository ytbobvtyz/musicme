"""
Endpoints для работы с заказами
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
import logging

from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.order import Order, OrderCreate, OrderDetail
from app.schemas.user import User as UserSchema
from app.crud.order import crud_order



router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Создать новый заказ
    """
    try:
        logger.info(f"Создание заказа для пользователя {current_user.id}")
        logger.info(f"Данные заказа: {order_data.dict()}")
        
        order = await crud_order.create(db, order_data, current_user.id)
        
        # Обновляем заказ чтобы загрузить связи
        await db.refresh(order, ['theme', 'genre'])
        
        logger.info(f"Заказ создан: {order.id}")
        return order
        
    except Exception as e:
        logger.error(f"Ошибка при создании заказа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании заказа: {str(e)}"
        )


@router.get("", response_model=List[Order])  # ⬅️ Исправь тип ответа
async def get_orders(
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)  # ⬅️ ДОБАВЬ ЗАВИСИМОСТЬ
):
    """
    Получить список заказов пользователя
    """
    orders = await crud_order.get_by_user(db, current_user.id)
    return orders


@router.get("/{order_id}", response_model=OrderDetail)  # ← Меняем на OrderDetail
async def get_order(
    order_id: UUID,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Получить детальную информацию о заказе с треками
    """
    try:
        print(f"🔍 GET ORDER - Order ID: {order_id}, User ID: {current_user.id}")
        
        order = await crud_order.get_by_id(db, order_id)
        print(f"📦 Order found: {order is not None}")
        
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")