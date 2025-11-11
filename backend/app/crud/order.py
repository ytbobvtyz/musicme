"""
CRUD операции для заказов
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from typing import List, Optional

from app.models.order import Order as OrderModel
from app.schemas.order import OrderCreate


class CRUDOrder:
    async def create(self, db: AsyncSession, order_data: OrderCreate, user_id: UUID) -> OrderModel:
        """Создать новый заказ"""
        order = OrderModel(**order_data.dict(), user_id=user_id)
        db.add(order)
        await db.commit()
        await db.refresh(order)
        return order

    async def get_by_user(self, db: AsyncSession, user_id: UUID) -> List[OrderModel]:
        """Получить заказы пользователя"""
        result = await db.execute(
            select(OrderModel)
            .where(OrderModel.user_id == user_id)
            .order_by(OrderModel.created_at.desc())
        )
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, order_id: UUID) -> Optional[OrderModel]:
        """Получить заказ по ID"""
        result = await db.execute(
            select(OrderModel).where(OrderModel.id == order_id)
        )
        return result.scalar_one_or_none()


crud_order = CRUDOrder()