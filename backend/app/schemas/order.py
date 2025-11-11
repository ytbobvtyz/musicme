"""
Схемы заказа
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field

from app.schemas.track import Track
from app.schemas.user import User


class OrderBase(BaseModel):
    """Базовая схема заказа"""
    theme: str
    genre: str
    recipient_name: str = Field(..., max_length=100)
    occasion: Optional[str] = Field(None, max_length=200)
    details: Optional[str] = Field(None, max_length=1000)
    preferences: Optional[Dict[str, Any]] = None


class OrderCreate(OrderBase):
    """Схема для создания заказа"""
    pass


class Order(OrderBase):
    """Схема заказа"""
    id: UUID
    user_id: UUID
    status: str
    interview_link: Optional[str] = None
    estimated_time: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class OrderDetail(Order):
    """Детальная схема заказа с треками"""
    tracks: List[Track] = []


# ⬇️⬇️⬇️ ИСПРАВЬ ЭТУ СХЕМУ ⬇️⬇️⬇️
class AdminOrder(Order):
    """Схема заказа для админки с пользователем"""
    user: Optional[User] = None  # Делаем опциональным для обратной совместимости
    tracks_count: int = 0

    class Config:
        from_attributes = True


# ⬇️⬇️⬇️ ДОБАВЬ НОВУЮ СХЕМУ ⬇️⬇️⬇️
class OrderWithUser(Order):
    """Схема заказа с информацией о пользователе"""
    user: Optional[User] = None

    class Config:
        from_attributes = True