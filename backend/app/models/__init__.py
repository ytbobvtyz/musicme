
"""
Импорт всех моделей для корректного создания таблиц
"""
from app.models.user import User
from app.models.theme import Theme
from app.models.genre import Genre  
from app.models.order import Order
from app.models.track import Track
from app.models.example_track import ExampleTrack

# Экспортируем все модели
__all__ = [
    "User",
    "Theme", 
    "Genre",
    "Order",
    "Track",
    "ExampleTrack"
]