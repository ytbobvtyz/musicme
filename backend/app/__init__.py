# App package

"""
Инициализация приложения и зависимостей
"""

# Убедитесь что все сервисы импортируются корректно
from app.services.order_status_service import order_status_service
from app.services.notification_service import notification_service
from app.bot import get_bot_instance

__all__ = [
    'order_status_service',
    'notification_service',
    'get_bot_instance'
]