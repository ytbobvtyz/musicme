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
from fastapi import HTTPException, status
from app.models.order import Order as OrderModel, OrderStatus, TariffPlan
from app.schemas.order import OrderCreate, OrderUpdate
from app.core.tariffs import get_tariff_config, get_tariff_price, get_tariff_rounds

class CRUDOrder:
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
            
            from datetime import datetime, timezone, timedelta
            from app.core.tariffs import get_tariff_config
            
            # ⬇️ РАСКОММЕНТИРУЕМ полную логику тарифов
            tariff_plan = order_dict.get('tariff_plan', 'basic')
            tariff_config = get_tariff_config(tariff_plan)
            
            # Автоматически устанавливаем цену и правки из конфига
            order_dict['price'] = tariff_config['price']
            order_dict['rounds_remaining'] = tariff_config['rounds']
            
            # Вычисляем дедлайн
            deadline_days = tariff_config['deadline_days']
            order_dict['deadline_at'] = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=deadline_days)
            
            # ⬇️ РАСКОММЕНТИРУЕМ валидацию для продвинутых тарифов
            if tariff_config['has_questionnaire']:
                if not order_dict.get('preferences') or not order_dict['preferences'].get('questionnaire'):
                    from fastapi import HTTPException, status
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Для тарифа '{tariff_plan}' требуется заполнить анкету"
                    )
            
            # Устанавливаем user_id
            order_dict['user_id'] = user_id
                
            print(f"🎯 Final order data: {order_dict}")
            print(f"💰 Tariff: {tariff_plan}, Price: {tariff_config['price']}, Rounds: {tariff_config['rounds']}, Deadline: {deadline_days} days")
                
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