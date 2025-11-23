"""
Схемы заказа
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field

from app.schemas.track import Track
from app.schemas.user import User
from app.schemas.theme import Theme
from app.schemas.genre import Genre

class OrderBase(BaseModel):
    recipient_name: str = Field(..., max_length=100)
    occasion: Optional[str] = Field(None, max_length=200)
    details: Optional[str] = Field(None, max_length=1000)
    preferences: Optional[Dict[str, Any]] = None
    theme_id: UUID
    genre_id: UUID
    producer_id: Optional[UUID] = None
    # ⬇️ НОВЫЕ ПОЛЯ ДЛЯ ТАРИФОВ
    tariff_plan: str = Field(default="basic")
    # price: int = Field(..., gt=0)  # цена должна быть > 0

class OrderCreate(OrderBase):
    """Схема для создания заказа"""
    pass

class OrderUpdate(BaseModel):
    """Схема для обновления заказа"""
    status: Optional[str] = None
    producer_id: Optional[UUID] = None
    rounds_remaining: Optional[int] = None
    interview_link: Optional[str] = None

class Order(OrderBase):
    id: UUID
    user_id: UUID
    producer_id: Optional[UUID] = None
    status: str
    deadline_at: datetime  # ⬅️ ЗАМЕНЯЕМ estimated_time
    rounds_remaining: int = Field(default=0)
    interview_link: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # Связи - делаем опциональными
    theme: Optional[Theme] = None
    genre: Optional[Genre] = None
    producer: Optional[User] = None
    
    class Config:
        from_attributes = True

class OrderDetail(Order):
    """Детальная схема заказа с треками"""
    tracks: List[Track] = []
    price: int
    
class AdminOrder(Order):
    """Схема заказа для админки с пользователем"""
    user: Optional[User] = None
    tracks_count: int = 0

    class Config:
        from_attributes = True

class OrderWithUser(Order):
    """Схема заказа с информацией о пользователе"""
    user: Optional[User] = None

    class Config:
        from_attributes = True