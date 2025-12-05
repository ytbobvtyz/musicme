"""
Инициализация приложения
"""

# Ленивая загрузка сервисов
def get_order_status_service():
    from app.services.order_status_service import order_status_service
    return order_status_service

def get_notification_service():
    from app.services.notification_service import notification_service
    return notification_service

def get_bot_instance():
    from app.bot.bot import get_bot_instance as _get_bot_instance
    return _get_bot_instance

__all__ = [
    'get_order_status_service',
    'get_notification_service', 
    'get_bot_instance'
]