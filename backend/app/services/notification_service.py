"""
Сервис для отправки уведомлений через разные каналы
"""
import logging
from typing import Optional
from uuid import UUID

from app.bot.notifications import (
    send_order_created_notification as bot_notify_order_created,
    send_order_ready_notification as bot_notify_order_ready,
    send_admin_notification as bot_notify_admin
)
from app.core.database import AsyncSessionLocal
from app.crud.user import crud_user
from app.models.order import Order as OrderModel

logger = logging.getLogger(__name__)


class NotificationService:
    """Сервис уведомлений"""
    
    @staticmethod
    async def notify_order_created(order_id: UUID) -> bool:
        """
        Уведомить о создании заказа
        
        Args:
            order_id: UUID заказа
            
        Returns:
            bool: True если уведомления отправлены успешно
        """
        try:
            async with AsyncSessionLocal() as db:
                # Получаем полные данные заказа
                from app.crud.order import crud_order
                order = await crud_order.get_by_id(db, order_id)
                
                if not order:
                    logger.error(f"Заказ {order_id} не найден для уведомления")
                    return False
                
                # Получаем пользователя
                user = await crud_user.get_by_id(db, order.user_id)
                if not user:
                    logger.error(f"Пользователь {order.user_id} не найден для заказа {order_id}")
                    return False
                
                # 1. Telegram уведомление пользователю (если есть telegram_id)
                telegram_sent = False
                if user.telegram_id:
                    try:
                        telegram_sent = await bot_notify_order_created(order)
                    except Exception as e:
                        logger.error(f"Ошибка отправки Telegram уведомления: {e}")
                
                # 2. Уведомление администратору
                admin_message = (
                    f"🎵 <b>Новый заказ #{str(order.id)[:8]}</b>\n\n"
                    f"<b>Тариф:</b> {order.tariff_plan}\n"
                    f"<b>Сумма:</b> {order.price} руб.\n"
                    f"<b>Пользователь:</b> {user.email}\n"
                    f"<b>Статус:</b> {order.status}\n\n"
                    f"🌐 <a href='https://musicme.ru/admin/orders/{order.id}'>Открыть в админке</a>"
                )
                
                admin_sent = await bot_notify_admin(admin_message)
                
                logger.info(
                    f"Уведомления о создании заказа {order_id} отправлены: "
                    f"Telegram={telegram_sent}, Admin={admin_sent}"
                )
                
                return telegram_sent or admin_sent
                
        except Exception as e:
            logger.error(f"Критическая ошибка при отправке уведомлений: {e}")
            return False
    
    @staticmethod
    async def notify_order_ready(order_id: UUID) -> bool:
        """
        Уведомить о готовности демо-версии
        
        Args:
            order_id: UUID заказа
            
        Returns:
            bool: True если уведомления отправлены успешно
        """
        try:
            async with AsyncSessionLocal() as db:
                # Получаем полные данные заказа
                from app.crud.order import crud_order
                order = await crud_order.get_by_id(db, order_id)
                
                if not order:
                    logger.error(f"Заказ {order_id} не найден для уведомления")
                    return False
                
                # Проверяем что есть preview_url
                from app.crud.track import crud_track
                preview_tracks = await crud_track.get_by_order(db, order_id, is_preview=True)
                
                if not preview_tracks:
                    logger.error(f"У заказа {order_id} нет preview треков")
                    return False
                
                # Берем первый preview трек
                preview_track = preview_tracks[0]
                
                # Получаем пользователя
                user = await crud_user.get_by_id(db, order.user_id)
                if not user:
                    logger.error(f"Пользователь {order.user_id} не найден для заказа {order_id}")
                    return False
                
                # Telegram уведомление пользователю (если есть telegram_id)
                telegram_sent = False
                if user.telegram_id:
                    try:
                        # Создаем URL для preview
                        preview_url = f"https://musicme.ru/track/{order_id}"
                        
                        # Нужно скопировать order и добавить preview_url
                        import copy
                        order_with_preview = copy.copy(order)
                        order_with_preview.preview_url = preview_url
                        
                        telegram_sent = await bot_notify_order_ready(order_with_preview)
                    except Exception as e:
                        logger.error(f"Ошибка отправки Telegram уведомления: {e}")
                
                logger.info(
                    f"Уведомления о готовности заказа {order_id} отправлены: "
                    f"Telegram={telegram_sent}"
                )
                
                return telegram_sent
                
        except Exception as e:
            logger.error(f"Критическая ошибка при отправке уведомлений: {e}")
            return False
    
    @staticmethod
    async def notify_order_status_changed(
        order_id: UUID, 
        old_status: str, 
        new_status: str
    ) -> bool:
        """
        Уведомить об изменении статуса заказа
        
        Args:
            order_id: UUID заказа
            old_status: предыдущий статус
            new_status: новый статус
            
        Returns:
            bool: True если уведомления отправлены успешно
        """
        try:
            async with AsyncSessionLocal() as db:
                # Получаем заказ
                from app.crud.order import crud_order
                order = await crud_order.get_by_id(db, order_id)
                
                if not order:
                    logger.error(f"Заказ {order_id} не найден")
                    return False
                
                # Статусы, которые требуют уведомления пользователя
                user_notification_statuses = [
                    "paid",
                    "ready_for_final_review",
                    "completed",
                    "cancelled"
                ]
                
                # Статусы, которые требуют уведомления администратора
                admin_notification_statuses = [
                    "paid",
                    "payment_pending",
                    "ready_for_review",
                    "cancelled"
                ]
                
                # Формируем сообщение
                status_names = {
                    "draft": "📝 Черновик",
                    "in_progress": "⚙️ В работе",
                    "ready_for_review": "🎵 Готово для прослушивания",
                    "payment_pending": "💳 Ожидает оплаты",
                    "paid": "✅ Оплачено",
                    "ready_for_final_review": "🎶 Готов финальный вариант",
                    "completed": "🎉 Завершено",
                    "cancelled": "❌ Отменено"
                }
                
                old_status_name = status_names.get(old_status, old_status)
                new_status_name = status_names.get(new_status, new_status)
                
                message = (
                    f"📊 <b>Статус заказа #{str(order.id)[:8]} изменен</b>\n\n"
                    f"Было: {old_status_name}\n"
                    f"Стало: {new_status_name}\n\n"
                    f"🌐 <a href='https://musicme.ru/order/{order.id}'>Открыть заказ</a>"
                )
                
                # Отправляем администратору если нужно
                if new_status in admin_notification_statuses:
                    await bot_notify_admin(message)
                
                # Отправляем пользователю если нужно и есть telegram_id
                if new_status in user_notification_statuses:
                    user = await crud_user.get_by_id(db, order.user_id)
                    if user and user.telegram_id:
                        # Формируем сообщение для пользователя
                        user_message = (
                            f"📊 <b>Статус вашего заказа #{str(order.id)[:8]}</b>\n\n"
                            f"Обновлен: {new_status_name}\n"
                        )
                        
                        if new_status == "paid":
                            user_message += "\n✅ Оплата подтверждена! Готовим полную версию."
                        elif new_status == "ready_for_final_review":
                            user_message += "\n🎶 Финальная версия готова! Можете скачать."
                        elif new_status == "completed":
                            user_message += "\n🎉 Заказ успешно завершен!"
                        elif new_status == "cancelled":
                            user_message += "\n❌ Заказ отменен."
                        
                        user_message += f"\n\n🌐 <a href='https://musicme.ru/order/{order.id}'>Открыть заказ</a>"
                        
                        await bot_notify_admin(user_message)  # Временно через admin функцию
                
                logger.info(f"Уведомление об изменении статуса {order_id}: {old_status} → {new_status}")
                return True
                
        except Exception as e:
            logger.error(f"Ошибка при отправке уведомления об изменении статуса: {e}")
            return False
    
    @staticmethod
    async def notify_admin(message: str, chat_id: Optional[int] = None) -> bool:
        """
        Уведомить администратора
        
        Args:
            message: Текст сообщения
            chat_id: Optional Telegram chat ID (если не указан - из настроек)
            
        Returns:
            bool: True если уведомление отправлено успешно
        """
        try:
            return await bot_notify_admin(message, chat_id)
        except Exception as e:
            logger.error(f"Ошибка отправки уведомления администратору: {e}")
            return False


# Глобальный экземпляр сервиса
notification_service = NotificationService()