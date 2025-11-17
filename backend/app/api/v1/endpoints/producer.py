from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.order import Order

from app.core.deps import get_current_user
from app.core.database import get_db
from app.crud.order import crud_order
from app.models.user import User as UserModel

router = APIRouter()

async def get_producer_orders(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Получить заказы текущего продюсера
    """
    try:
        # Проверяем что пользователь продюсер
        if not current_user.is_producer and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Только продюсеры могут просматривать свои заказы"
            )
        
        # Получаем заказы продюсера
        orders = await crud_order.get_by_producer(
            db, 
            producer_id=current_user.id,
            status=status
        )
        
        return [Order.model_validate(order) for order in orders]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении заказов: {str(e)}"
        )