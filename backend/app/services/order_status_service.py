"""
Сервис для работы со статусами заказов
"""
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.models.order import Order as OrderModel, OrderStatus
from app.crud.track import crud_track
from app.services.notification_service import notification_service

logger = logging.getLogger(__name__)


class OrderStatusService:
    """Сервис для управления статусами заказов"""
    
    async def on_tracks_changed(self, db: AsyncSession, order_id: UUID) -> bool:
        """
        Обновить статус заказа при изменении треков
        
        Args:
            db: Сессия базы данных
            order_id: ID заказа
            
        Returns:
            bool: True если статус изменен
        """
        try:
            from app.crud.order import crud_order
            
            # Получаем заказ с треками
            order = await crud_order.get_by_id(db, order_id)
            if not order:
                logger.error(f"Заказ {order_id} не найден")
                return False
            
            old_status = order.status
            
            # Получаем треки заказа
            tracks = await crud_track.get_by_order(db, order_id)
            
            # Если нет треков - ничего не меняем
            if not tracks:
                return False
            
            # Проверяем наличие preview треков
            has_preview = any(track.is_preview for track in tracks)
            has_final = any(not track.is_preview for track in tracks)
            
            status_changed = False
            
            # Логика изменения статусов
            if has_preview and order.status in [OrderStatus.IN_PROGRESS, OrderStatus.DRAFT]:
                # Если добавили preview трек → READY_FOR_REVIEW
                order.status = OrderStatus.READY_FOR_REVIEW
                status_changed = True
                
            elif has_final and not has_preview and order.status == OrderStatus.READY_FOR_REVIEW:
                # Если добавили полные треки (нет preview) → READY_FOR_FINAL_REVIEW
                order.status = OrderStatus.READY_FOR_FINAL_REVIEW
                status_changed = True
                
            elif has_final and order.status == OrderStatus.PAID:
                # Если заказ оплачен и добавлены финальные треки → READY_FOR_FINAL_REVIEW
                order.status = OrderStatus.READY_FOR_FINAL_REVIEW
                status_changed = True
            
            if status_changed:
                await db.commit()
                
                # Отправляем уведомление об изменении статуса
                await notification_service.notify_order_status_changed(
                    order_id, old_status, order.status
                )
                
                # Дополнительное уведомление для READY_FOR_REVIEW
                if order.status == OrderStatus.READY_FOR_REVIEW:
                    await notification_service.notify_order_ready(order_id)
                
                logger.info(
                    f"Статус заказа {order_id} изменен: {old_status} → {order.status} "
                    f"(треков: {len(tracks)}, preview: {has_preview}, final: {has_final})"
                )
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Ошибка в on_tracks_changed для заказа {order_id}: {e}")
            await db.rollback()
            return False
    
    async def on_revision_requested(
        self, 
        db: AsyncSession, 
        order_id: UUID,
        comment: Optional[str] = None
    ) -> bool:
        """
        Пользователь запросил правку
        
        Args:
            db: Сессия базы данных
            order_id: ID заказа
            comment: Комментарий к правке
            
        Returns:
            bool: True если правки доступны, False если лимит исчерпан
        """
        try:
            from app.crud.order import crud_order
            
            order = await crud_order.get_by_id(db, order_id)
            if not order:
                logger.error(f"Заказ {order_id} не найден")
                return False
            
            old_status = order.status
            
            if order.rounds_remaining > 0:
                order.rounds_remaining -= 1
                order.status = OrderStatus.IN_PROGRESS
                
                await db.commit()
                
                # Уведомляем об изменении статуса
                await notification_service.notify_order_status_changed(
                    order_id, old_status, order.status
                )
                
                # Уведомление продюсеру о запросе правки
                if order.producer_id:
                    admin_message = (
                        f"🔧 <b>Запрошена правка для заказа #{str(order.id)[:8]}</b>\n\n"
                        f"<b>Осталось правок:</b> {order.rounds_remaining}\n"
                    )
                    
                    if comment:
                        admin_message += f"<b>Комментарий:</b> {comment}\n\n"
                    
                    admin_message += f"🌐 <a href='https://musicme.ru/producer/orders/{order.id}'>Открыть заказ</a>"
                    
                    await notification_service.notify_admin(admin_message)
                
                logger.info(
                    f"Правка запрошена для заказа {order_id}, "
                    f"осталось правок: {order.rounds_remaining}"
                )
                return True
                
            else:
                # Лимит правок исчерпан
                order.status = OrderStatus.COMPLETED
                await db.commit()
                
                # Уведомляем об изменении статуса
                await notification_service.notify_order_status_changed(
                    order_id, old_status, order.status
                )
                
                logger.info(
                    f"Лимит правок исчерпан для заказа {order_id}, "
                    f"статус изменен на COMPLETED"
                )
                return False
                
        except Exception as e:
            logger.error(f"Ошибка в on_revision_requested для заказа {order_id}: {e}")
            await db.rollback()
            return False
    
    async def on_payment_confirmed(
        self, 
        db: AsyncSession, 
        order_id: UUID
    ) -> bool:
        """
        Обработка подтверждения оплаты
        
        Args:
            db: Сессия базы данных
            order_id: ID заказа
            
        Returns:
            bool: True если обработка успешна
        """
        try:
            from app.crud.order import crud_order
            
            order = await crud_order.get_by_id(db, order_id)
            if not order:
                logger.error(f"Заказ {order_id} не найден")
                return False
            
            old_status = order.status
            
            # Меняем статус на оплачено
            if order.status == OrderStatus.READY_FOR_REVIEW:
                order.status = OrderStatus.PAID
                
                await db.commit()
                
                # Уведомляем об изменении статуса
                await notification_service.notify_order_status_changed(
                    order_id, old_status, order.status
                )
                
                # Уведомление администратору для проверки оплаты
                admin_message = (
                    f"💰 <b>Оплата подтверждена для заказа #{str(order.id)[:8]}</b>\n\n"
                    f"<b>Сумма:</b> {order.price} руб.\n"
                    f"<b>Тариф:</b> {order.tariff_plan}\n\n"
                    f"🌐 <a href='https://musicme.ru/admin/orders/{order.id}'>Проверить оплату</a>"
                )
                
                await notification_service.notify_admin(admin_message)
                
                logger.info(f"Оплата подтверждена для заказа {order_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Ошибка в on_payment_confirmed для заказа {order_id}: {e}")
            await db.rollback()
            return False
    
    async def on_final_revision_requested(
        self, 
        db: AsyncSession, 
        order_id: UUID,
        comment: Optional[str] = None
    ) -> bool:
        """
        Обработка запроса финальной правки
        
        Args:
            db: Сессия базы данных
            order_id: ID заказа
            comment: Комментарий к правке
            
        Returns:
            bool: True если обработка успешна
        """
        try:
            from app.crud.order import crud_order
            
            order = await crud_order.get_by_id(db, order_id)
            if not order:
                logger.error(f"Заказ {order_id} не найден")
                return False
            
            old_status = order.status
            
            # Меняем статус на финальную правку
            if order.status == OrderStatus.READY_FOR_FINAL_REVIEW:
                order.status = OrderStatus.IN_PROGRESS_FINAL_REVISION
                
                await db.commit()
                
                # Уведомляем об изменении статуса
                await notification_service.notify_order_status_changed(
                    order_id, old_status, order.status
                )
                
                # Уведомление продюсеру о финальной правке
                if order.producer_id:
                    admin_message = (
                        f"🎵 <b>Запрошена финальная правка для заказа #{str(order.id)[:8]}</b>\n\n"
                        f"<b>Статус:</b> Финальная правка\n"
                    )
                    
                    if comment:
                        admin_message += f"<b>Комментарий:</b> {comment}\n\n"
                    
                    admin_message += f"🌐 <a href='https://musicme.ru/producer/orders/{order.id}'>Открыть заказ</a>"
                    
                    await notification_service.notify_admin(admin_message)
                
                logger.info(f"Финальная правка запрошена для заказа {order_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Ошибка в on_final_revision_requested для заказа {order_id}: {e}")
            await db.rollback()
            return False
    
    async def on_order_completed(
        self, 
        db: AsyncSession, 
        order_id: UUID
    ) -> bool:
        """
        Обработка завершения заказа
        
        Args:
            db: Сессия базы данных
            order_id: ID заказа
            
        Returns:
            bool: True если обработка успешна
        """
        try:
            from app.crud.order import crud_order
            
            order = await crud_order.get_by_id(db, order_id)
            if not order:
                logger.error(f"Заказ {order_id} не найден")
                return False
            
            old_status = order.status
            
            # Меняем статус на завершенный
            order.status = OrderStatus.COMPLETED
            
            await db.commit()
            
            # Уведомляем об изменении статуса
            await notification_service.notify_order_status_changed(
                order_id, old_status, order.status
            )
            
            logger.info(f"Заказ {order_id} завершен")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка в on_order_completed для заказа {order_id}: {e}")
            await db.rollback()
            return False
    
    async def on_order_cancelled(
        self, 
        db: AsyncSession, 
        order_id: UUID,
        reason: Optional[str] = None
    ) -> bool:
        """
        Обработка отмены заказа
        
        Args:
            db: Сессия базы данных
            order_id: ID заказа
            reason: Причина отмены
            
        Returns:
            bool: True если обработка успешна
        """
        try:
            from app.crud.order import crud_order
            
            order = await crud_order.get_by_id(db, order_id)
            if not order:
                logger.error(f"Заказ {order_id} не найден")
                return False
            
            old_status = order.status
            
            # Меняем статус на отмененный
            order.status = OrderStatus.CANCELLED
            
            await db.commit()
            
            # Уведомляем об изменении статуса
            await notification_service.notify_order_status_changed(
                order_id, old_status, order.status
            )
            
            # Уведомление администратору об отмене
            admin_message = (
                f"❌ <b>Заказ отменен #{str(order.id)[:8]}</b>\n\n"
                f"<b>Тариф:</b> {order.tariff_plan}\n"
                f"<b>Сумма:</b> {order.price} руб.\n"
            )
            
            if reason:
                admin_message += f"<b>Причина:</b> {reason}\n\n"
            
            admin_message += f"🌐 <a href='https://musicme.ru/admin/orders/{order.id}'>Открыть заказ</a>"
            
            await notification_service.notify_admin(admin_message)
            
            logger.info(f"Заказ {order_id} отменен, причина: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка в on_order_cancelled для заказа {order_id}: {e}")
            await db.rollback()
            return False


# Глобальный экземпляр сервиса
order_status_service = OrderStatusService()