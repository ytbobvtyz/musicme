# app/api/v1/endpoints/producer.py
"""
Endpoints для работы продюсера с заказами
"""
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import traceback

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.order import Order
from app.schemas.order import Order as OrderSchema
from app.crud.order import crud_order

router = APIRouter()

@router.get("/orders", response_model=List[OrderSchema])
async def get_producer_orders(
    order_status: Optional[str] = None,  # ← ПЕРЕИМЕНОВАЛИ ПАРАМЕТР
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получить заказы текущего продюсера
    """
    try:
        print(f"🔍 Producer orders request from: {current_user.id} ({current_user.email})")
        print(f"🔍 is_producer: {current_user.is_producer}, is_admin: {current_user.is_admin}")
        print(f"🔍 Status filter: {order_status}")  # ← используем переименованный параметр
        
        # Проверяем что пользователь продюсер или админ
        if not current_user.is_producer and not current_user.is_admin:
            print("❌ User is not producer or admin")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Только продюсеры могут просматривать свои заказы"
            )
        
        # Получаем заказы продюсера
        orders = await crud_order.get_by_producer(
            db, 
            producer_id=current_user.id,
            status=order_status  # ← используем переименованный параметр
        )
        
        print(f"🔍 Found {len(orders)} orders for producer")
        
        # Преобразуем в схему без связанных объектов чтобы избежать ошибок
        result = []
        for order in orders:
            order_dict = {
                "id": order.id,
                "user_id": order.user_id,
                "theme_id": order.theme_id,
                "genre_id": order.genre_id,
                "producer_id": order.producer_id,
                "recipient_name": order.recipient_name,
                "occasion": order.occasion,
                "details": order.details,
                "tariff_plan": order.tariff_plan,
                "preferences": order.preferences,
                "status": order.status,
                "deadline_at": order.deadline_at,
                "price": order.price,
                "rounds_remaining": order.rounds_remaining,
                "interview_link": order.interview_link,
                "created_at": order.created_at,
                "updated_at": order.updated_at,
            }
            result.append(order_dict)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting producer orders: {str(e)}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении заказов: {str(e)}"
        )

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: UUID,
    status_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Обновить статус заказа (для продюсера)
    """
    try:
        new_status = status_data.get("status")
        if not new_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="status обязателен"
            )
        
        # Получаем заказ
        order = await crud_order.get(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Заказ не найден"
            )
        
        # Проверяем что заказ принадлежит текущему продюсеру
        if order.producer_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Вы не являетесь продюсером этого заказа"
            )
        
        # Обновляем статус
        order.status = new_status
        await db.commit()
        await db.refresh(order)
        
        return {"message": "Статус заказа обновлен", "status": order.status}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении статуса: {str(e)}"
        )