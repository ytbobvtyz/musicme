"""
CRUD операции для заказов
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import and_, or_
from uuid import UUID
from typing import List, Optional
from datetime import datetime

from app.models.order import Order as OrderModel, OrderStatus, TariffPlan
from app.schemas.order import OrderCreate, OrderUpdate


class CRUDOrder:
    async def create(
        self, 
        db: AsyncSession, 
        order_data: OrderCreate, 
        user_id: Optional[UUID] = None,
        guest_email: Optional[str] = None
    ) -> OrderModel:
        """Создать новый заказ (с поддержкой гостевых заказов)"""
        order_dict = order_data.dict()
        
        # Для гостевых заказов
        if guest_email and not user_id:
            order_dict['guest_email'] = guest_email
            
        # Для авторизованных пользователей
        if user_id:
            order_dict['user_id'] = user_id
            
        order = OrderModel(**order_dict)
        db.add(order)
        await db.commit()
        await db.refresh(order)
        return order

    async def get_by_user(self, db: AsyncSession, user_id: UUID) -> List[OrderModel]:
        """Получить заказы пользователя"""
        result = await db.execute(
            select(OrderModel)
            .where(OrderModel.user_id == user_id)
            .options(
                selectinload(OrderModel.theme), 
                selectinload(OrderModel.genre),
                selectinload(OrderModel.tracks)
            )
            .order_by(OrderModel.created_at.desc())
        )
        return result.scalars().all()

    async def get_by_guest_email(self, db: AsyncSession, guest_email: str) -> List[OrderModel]:
        """Получить заказы по guest_email"""
        result = await db.execute(
            select(OrderModel)
            .where(OrderModel.guest_email == guest_email)
            .options(
                selectinload(OrderModel.theme), 
                selectinload(OrderModel.genre),
                selectinload(OrderModel.tracks)
            )
            .order_by(OrderModel.created_at.desc())
        )
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, order_id: UUID) -> Optional[OrderModel]:
        """Получить заказ по ID с треками"""
        result = await db.execute(
            select(OrderModel)
            .where(OrderModel.id == order_id)
            .options(
                selectinload(OrderModel.theme), 
                selectinload(OrderModel.genre),
                selectinload(OrderModel.tracks),
                selectinload(OrderModel.user)
            )
        )
        return result.scalar_one_or_none()

    async def get_all(
        self, 
        db: AsyncSession, 
        status_filter: Optional[str] = None,
        tariff_filter: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[OrderModel]:
        """Получить все заказы (для админки) с фильтрацией"""
        query = select(OrderModel).options(
            selectinload(OrderModel.theme), 
            selectinload(OrderModel.genre),
            selectinload(OrderModel.user)
        )
        
        # Применяем фильтры
        filters = []
        if status_filter:
            filters.append(OrderModel.status == status_filter)
        if tariff_filter:
            filters.append(OrderModel.tariff_plan == tariff_filter)
            
        if filters:
            query = query.where(and_(*filters))
            
        query = query.order_by(OrderModel.created_at.desc()).limit(limit).offset(offset)
        
        result = await db.execute(query)
        return result.scalars().all()

    async def update(
        self, 
        db: AsyncSession, 
        order_id: UUID, 
        update_data: OrderUpdate
    ) -> Optional[OrderModel]:
        """Обновить заказ"""
        order = await self.get_by_id(db, order_id)
        if not order:
            return None
            
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(order, field, value)
            
        await db.commit()
        await db.refresh(order)
        return order

    async def update_status(
        self, 
        db: AsyncSession, 
        order_id: UUID, 
        status: OrderStatus
    ) -> Optional[OrderModel]:
        """Обновить статус заказа"""
        order = await self.get_by_id(db, order_id)
        if not order:
            return None
            
        order.status = status
        await db.commit()
        await db.refresh(order)
        return order

    async def get_overdue_orders(self, db: AsyncSession) -> List[OrderModel]:
        """Получить просроченные заказы"""
        result = await db.execute(
            select(OrderModel)
            .where(
                and_(
                    OrderModel.deadline_at < datetime.utcnow(),
                    OrderModel.status.in_([
                        OrderStatus.DRAFT,
                        OrderStatus.WAITING_INTERVIEW, 
                        OrderStatus.IN_PROGRESS,
                        OrderStatus.READY_FOR_REVIEW
                    ])
                )
            )
            .options(
                selectinload(OrderModel.user),
                selectinload(OrderModel.theme),
                selectinload(OrderModel.genre)
            )
        )
        return result.scalars().all()

    async def assign_to_user(
        self, 
        db: AsyncSession, 
        order_id: UUID, 
        user_id: UUID
    ) -> Optional[OrderModel]:
        """Привязать гостевой заказ к пользователю"""
        order = await self.get_by_id(db, order_id)
        if not order:
            return None
            
        order.user_id = user_id
        order.guest_email = None  # Очищаем guest_email после привязки
        await db.commit()
        await db.refresh(order)
        return order

crud_order = CRUDOrder()