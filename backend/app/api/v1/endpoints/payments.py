# app/api/v1/endpoints/payments.py
"""
Endpoints для работы с платежами
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.crud.order import crud_order

router = APIRouter()

class PaymentInitiateRequest(BaseModel):
    """Запрос на инициализацию платежа"""
    order_id: UUID  # Меняем track_id на order_id
    amount: int = 9900
    currency: str = "RUB"

class PaymentResponse(BaseModel):
    """Ответ при инициализации платежа"""
    payment_id: str
    payment_url: str
    confirmation_token: str
    amount: int
    currency: str

@router.post("/initiate", response_model=PaymentResponse)
async def initiate_payment(
    payment_data: PaymentInitiateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Инициировать платеж для заказа через ЮKassa
    """
    try:
        # Получаем заказ
        order = await crud_order.get_by_id(db, payment_data.order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        # Проверяем что заказ принадлежит текущему пользователю
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Нет доступа к заказу")
        
        # Проверяем что заказ в правильном статусе
        if order.status != OrderStatus.READY_FOR_REVIEW:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Оплата возможна только когда заказ готов для проверки"
            )
        
        # TODO: Реальная интеграция с ЮKassa
        # Пока возвращаем заглушку
        return PaymentResponse(
            payment_id=f"pay_{order.id}",
            payment_url=f"https://yookassa.ru/payment/{order.id}",
            confirmation_token="temp_token",
            amount=order.price,  # Используем цену из заказа
            currency="RUB"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании платежа: {str(e)}"
        )

@router.post("/webhook")
async def payment_webhook():
    """
    Webhook для обработки уведомлений от ЮKassa
    """
    # TODO: Реализовать обработку webhook от ЮKassa
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Webhook еще не реализован"
    )