"""
Pydantic схемы для валидации данных
"""
from app.schemas.user import User, UserCreate
from app.schemas.order import Order, OrderCreate, OrderDetail
from app.schemas.track import Track, TrackCreate
from app.schemas.auth import AuthResponse, OAuthRequest

__all__ = [
    "User", "UserCreate",
    "Order", "OrderCreate", "OrderDetail",
    "Track", "TrackCreate",
    "AuthResponse", "OAuthRequest",
]

