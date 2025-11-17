"""
CRUD операции для заказов
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import and_, or_
from uuid import UUID
from typing import List, Optional
from datetime import datetime, timedelta, timezone

from app.models.order import Order as OrderModel, OrderStatus
from app.schemas.order import OrderCreate, OrderUpdate
from app.crud.tariff import crud_tariff
from app.models.tariff_plan import TariffPlan

class CRUDOrder:
    async def get(self, db: AsyncSession, order_id: UUID) -> Optional[OrderModel]:
        """Получить заказ по ID"""
        result = await db.execute(
            select(OrderModel).where(OrderModel.id == order_id)
        )
        return result.scalar_one_or_none()
    async def create(
        self, 
        db: AsyncSession, 
        order_data: dict,
        user_id: UUID
    ) -> OrderModel:
        """Создать новый заказ с автоматической настройкой тарифа"""
        try:
            order_dict = order_data
            
            print(f"📦 Order dict received: {order_dict}")
            
            # ⬇️ ЗАМЕНЯЕМ старые импорты на работу с БД
            tariff_plan = None
            
            # 1. Сначала проверяем preferences.tariff
            if order_dict.get('preferences') and order_dict['preferences'].get('tariff'):
                tariff_plan = order_dict['preferences']['tariff']
            
            # 2. Если нет в preferences, проверяем корень
            if not tariff_plan and order_dict.get('tariff_plan'):
                tariff_plan = order_dict['tariff_plan']
            
            # 3. Если все еще нет - используем basic
            tariff_plan = tariff_plan or 'basic'
            print(f"🎯 Final tariff decision: {tariff_plan}")
            
            # Получаем тариф из БД
            tariff = await crud_tariff.get_by_code(db, tariff_plan)
            if not tariff:
                from fastapi import HTTPException, status
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Тариф '{tariff_plan}' не найден"
                )
            
            # Автоматически устанавливаем цену и правки из тарифа
            order_dict['price'] = tariff.price
            order_dict['rounds_remaining'] = tariff.rounds
            
            # Вычисляем дедлайн
            deadline_days = tariff.deadline_days
            order_dict['deadline_at'] = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=deadline_days)
            
            # Валидация для продвинутых тарифов
            if tariff.has_questionnaire:
                if not order_dict.get('preferences') or not order_dict['preferences'].get('questionnaire'):
                    from fastapi import HTTPException, status
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Для тарифа '{tariff_plan}' требуется заполнить анкету"
                    )
            
            # Устанавливаем user_id
            order_dict['user_id'] = user_id
                
            print(f"🎯 Final order data: {order_dict}")
            print(f"💰 Tariff: {tariff_plan}, Price: {tariff.price}, Rounds: {tariff.rounds}, Deadline: {deadline_days} days")
                
            order = OrderModel(**order_dict)
            db.add(order)
            await db.commit()
            await db.refresh(order)
            return order
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Error in CRUD order create: {e}")
            import traceback
            print(f"❌ Traceback: {traceback.format_exc()}")
            raise

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
                    OrderModel.deadline_at < datetime.now(timezone.utc).replace(tzinfo=None),
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

crud_order = CRUDOrder()