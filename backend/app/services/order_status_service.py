from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import OrderStatus

class OrderStatusService:
    
    async def on_tracks_changed(self, db: AsyncSession, order):
        """Обновить статус заказа при изменении треков"""
        
        # Если добавили preview трек → READY_FOR_REVIEW
        if any(track.is_preview for track in order.tracks):
            if order.status in [OrderStatus.IN_PROGRESS, OrderStatus.DRAFT]:
                order.status = OrderStatus.READY_FOR_REVIEW
                await db.commit()
        
        # Если добавили полные треки (нет preview) → READY
        elif order.tracks and not any(track.is_preview for track in order.tracks):
            if order.status == OrderStatus.READY_FOR_REVIEW:
                order.status = OrderStatus.READY
                await db.commit()
    
    async def on_revision_requested(self, db: AsyncSession, order):
        """Пользователь запросил правку"""
        if order.rounds_remaining > 0:
            order.rounds_remaining -= 1
            order.status = OrderStatus.IN_PROGRESS
            await db.commit()
            return True
        else:
            # Лимит правок исчерпан
            order.status = OrderStatus.COMPLETED
            await db.commit()
            return False

order_status_service = OrderStatusService()