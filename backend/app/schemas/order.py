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


class OrderCreate(OrderBase):
    """Схема для создания заказа"""
    pass


class Order(OrderBase):
    id: UUID
    user_id: UUID
    status: str
    interview_link: Optional[str] = None
    estimated_time: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # Связи - делаем опциональными
    theme: Optional[Theme] = None
    genre: Optional[Genre] = None
    
    class Config:
        from_attributes = True


class OrderDetail(Order):
    """Детальная схема заказа с треками"""
    tracks: List[Track] = []


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