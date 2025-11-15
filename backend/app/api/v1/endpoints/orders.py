"""
Endpoints для работы с заказами
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
import logging

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_user_optional
from app.schemas.order import Order, OrderCreate, OrderDetail, OrderUpdate
from app.schemas.user import User as UserSchema
from app.crud.order import crud_order
from app.models.order import TariffPlan, OrderStatus

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db = Depends(get_db),
    current_user: Optional[UserSchema] = Depends(get_current_user_optional)
):
    """
    Создать новый заказ (с поддержкой гостевых заказов)
    """
    try:
        logger.info(f"Создание заказа. Пользователь: {current_user.id if current_user else 'guest'}")
        logger.info(f"Данные заказа: {order_data.dict()}")
        
        # Валидация тарифа
        if order_data.tariff_plan not in [tp.value for tp in TariffPlan]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Недопустимый тариф: {order_data.tariff_plan}"
            )
        
        # Создаем заказ
        if current_user:
            # Авторизованный пользователь
            order = await crud_order.create(db, order_data, user_id=current_user.id)
        else:
            # Гостевой заказ
            if not order_data.guest_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Для гостевого заказа требуется email"
                )
            order = await crud_order.create(db, order_data, guest_email=order_data.guest_email)
        
        # Обновляем заказ чтобы загрузить связи
        await db.refresh(order, ['theme', 'genre'])
        
        logger.info(f"Заказ создан: {order.id}, тариф: {order.tariff_plan}")
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при создании заказа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании заказа: {str(e)}"
        )

@router.get("", response_model=List[Order])
async def get_orders(
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Получить список заказов пользователя
    """
    orders = await crud_order.get_by_user(db, current_user.id)
    return orders

@router.get("/guest/{guest_email}", response_model=List[Order])
async def get_guest_orders(
    guest_email: str,
    db = Depends(get_db)
):
    """
    Получить заказы по guest_email (для гостевого доступа)
    """
    orders = await crud_order.get_by_guest_email(db, guest_email)
    return orders

@router.get("/{order_id}", response_model=OrderDetail)
async def get_order(
    order_id: UUID,
    db = Depends(get_db),
    current_user: Optional[UserSchema] = Depends(get_current_user_optional)
):
    """
    Получить детальную информацию о заказе с треками
    """
    try:
        logger.info(f"🔍 GET ORDER - Order ID: {order_id}, User: {current_user.id if current_user else 'guest'}")
        
        order = await crud_order.get_by_id(db, order_id)
        logger.info(f"📦 Order found: {order is not None}")
        
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        # Проверка прав доступа
        if current_user:
            # Авторизованный пользователь - проверяем принадлежность
            if order.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
        else:
            # Гостевой доступ - проверяем guest_email
            if not order.guest_email:
                raise HTTPException(status_code=403, detail="Требуется авторизация")
            # В реальном сценарии здесь должна быть проверка токена или сессии
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

@router.patch("/{order_id}", response_model=Order)
async def update_order(
    order_id: UUID,
    order_update: OrderUpdate,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Обновить заказ (только статус и правки)
    """
    try:
        # Проверяем что заказ принадлежит пользователю
        order = await crud_order.get_by_id(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
        
        # Обновляем заказ
        updated_order = await crud_order.update(db, order_id, order_update)
        
        return updated_order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при обновлении заказа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении заказа: {str(e)}"
        )

@router.post("/{order_id}/approve", response_model=Order)
async def approve_order(
    order_id: UUID,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Подтвердить заказ после прослушивания preview (перевод в статус PAID)
    """
    try:
        # Проверяем что заказ принадлежит пользователю
        order = await crud_order.get_by_id(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
        
        # Проверяем что заказ в правильном статусе
        if order.status != OrderStatus.READY_FOR_REVIEW:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заказ не готов для подтверждения"
            )
        
        # Обновляем статус на PAID
        updated_order = await crud_order.update_status(db, order_id, OrderStatus.PAID)
        
        logger.info(f"Заказ подтвержден: {order_id}")
        return updated_order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при подтверждении заказа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при подтверждении заказа: {str(e)}"
        )

@router.post("/{order_id}/request-revision", response_model=Order)
async def request_revision(
    order_id: UUID,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Запросить правку для заказа
    """
    try:
        # Проверяем что заказ принадлежит пользователю
        order = await crud_order.get_by_id(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
        
        # Проверяем что есть доступные правки
        if order.rounds_remaining <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Лимит правок исчерпан"
            )
        
        # Уменьшаем количество оставшихся правок
        order.rounds_remaining -= 1
        order.status = OrderStatus.IN_PROGRESS  # Возвращаем в работу
        
        await db.commit()
        await db.refresh(order)
        
        logger.info(f"Запрошена правка для заказа: {order_id}, осталось правок: {order.rounds_remaining}")
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при запросе правки: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при запросе правки: {str(e)}"
        )