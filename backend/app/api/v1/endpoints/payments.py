"""
Endpoints для работы с платежами
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db

router = APIRouter()


class PaymentInitiateRequest(BaseModel):
    """Запрос на инициализацию платежа"""
    track_id: UUID
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
    # TODO: Добавить зависимость для получения текущего пользователя
):
    """
    Инициировать платеж через ЮKassa
    """
    # TODO: Реализовать интеграцию с ЮKassa
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Платежная система еще не реализована"
    )


@router.post("/webhook")
async def payment_webhook(
    # TODO: Добавить валидацию webhook от ЮKassa
):
    """
    Webhook для обработки уведомлений от ЮKassa
    """
    # TODO: Реализовать обработку webhook от ЮKassa
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Webhook еще не реализован"
    )

