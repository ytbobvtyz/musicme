"""
CRUD операции для статистики
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Tuple
import math

from app.models.order import Order as OrderModel
from app.models.user import User as UserModel
from app.models.track import Track as TrackModel
from app.models.theme import Theme as ThemeModel
from app.models.genre import Genre as GenreModel


class CRUDStats:
    async def get_core_metrics(self, db: AsyncSession, days: int = 30) -> Dict:
        """Основные бизнес-метрики"""
        # Общее количество заказов
        total_orders_result = await db.execute(select(func.count(OrderModel.id)))
        total_orders = total_orders_result.scalar() or 0

        # Выручка (только оплаченные заказы)
        revenue_result = await db.execute(
            select(func.sum(TrackModel.audio_size)).where(TrackModel.is_paid == True)
        )
        # Временная логика: считаем что каждый трек = 9900 рублей
        paid_tracks_count = revenue_result.scalar() or 0
        total_revenue = paid_tracks_count * 9900  # TODO: заменить на реальную логику цен

        # Средний чек
        average_order_value = total_revenue / total_orders if total_orders > 0 else 0

        # Конверсия (оплаченные заказы / все заказы)
        paid_orders_result = await db.execute(
            select(func.count(OrderModel.id)).where(OrderModel.status.in_(['paid', 'completed']))
        )
        paid_orders = paid_orders_result.scalar() or 0
        conversion_rate = paid_orders / total_orders if total_orders > 0 else 0

        # Активные пользователи (с заказами)
        active_users_result = await db.execute(
            select(func.count(func.distinct(OrderModel.user_id)))
        )
        active_users = active_users_result.scalar() or 0

        return {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "average_order_value": average_order_value,
            "conversion_rate": conversion_rate,
            "active_users": active_users
        }

    async def get_order_stats(self, db: AsyncSession, days: int = 30) -> Dict:
        """Статистика по заказам"""
        # Заказы по статусам
        status_count_result = await db.execute(
            select(OrderModel.status, func.count(OrderModel.id))
            .group_by(OrderModel.status)
        )
        orders_by_status = dict(status_count_result.all())

        # Временная шкала заказов (последние 7 дней)
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=7)
        
        timeline = []
        current_date = start_date.replace(tzinfo=timezone.utc)
        end_date = end_date.replace(tzinfo=timezone.utc)
        
        while current_date <= end_date:
            next_date = current_date + timedelta(days=1)
            day_orders_result = await db.execute(
                select(func.count(OrderModel.id))
                .where(and_(
                    OrderModel.created_at >= current_date,
                    OrderModel.created_at < next_date
                ))
            )
            day_count = day_orders_result.scalar() or 0
            day_revenue = day_count * 9900
            
            timeline.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "count": day_count,
                "revenue": day_revenue
            })
            current_date = next_date

        average_completion_time = 48

        return {
            "orders_by_status": orders_by_status,
            "orders_timeline": timeline,
            "average_completion_time": average_completion_time
        }

    async def get_financial_stats(self, db: AsyncSession, days: int = 30) -> Dict:
        """Финансовая статистика"""
        now = datetime.now(timezone.utc)
        
        # Выручка по периодам
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        day_orders_result = await db.execute(
            select(func.count(OrderModel.id))
            .where(OrderModel.created_at >= day_start)
        )
        day_orders = day_orders_result.scalar() or 0
        daily_revenue = day_orders * 9900

        week_start = now - timedelta(days=7)
        week_orders_result = await db.execute(
            select(func.count(OrderModel.id))
            .where(OrderModel.created_at >= week_start)
        )
        week_orders = week_orders_result.scalar() or 0
        weekly_revenue = week_orders * 9900

        month_start = now - timedelta(days=30)
        month_orders_result = await db.execute(
            select(func.count(OrderModel.id))
            .where(OrderModel.created_at >= month_start)
        )
        month_orders = month_orders_result.scalar() or 0
        monthly_revenue = month_orders * 9900

        revenue_growth = 0.15

        # Самые прибыльные темы
        themes_revenue_result = await db.execute(
            select(
                ThemeModel.name,
                func.count(OrderModel.id).label('count')
            )
            .join(OrderModel, OrderModel.theme_id == ThemeModel.id)
            .group_by(ThemeModel.name)
            .order_by(func.count(OrderModel.id).desc())
            .limit(5)
        )
        most_profitable_themes = [
            {"theme": row[0], "count": row[1], "revenue": row[1] * 9900}
            for row in themes_revenue_result.all()
        ]

        # Самые популярные жанры
        genres_popularity_result = await db.execute(
            select(
                GenreModel.name,
                func.count(OrderModel.id).label('count')
            )
            .join(OrderModel, OrderModel.genre_id == GenreModel.id)
            .group_by(GenreModel.name)
            .order_by(func.count(OrderModel.id).desc())
            .limit(5)
        )
        most_popular_genres = [
            {"genre": row[0], "count": row[1]}
            for row in genres_popularity_result.all()
        ]

        return {
            "revenue_by_period": {
                "daily": daily_revenue,
                "weekly": weekly_revenue,
                "monthly": monthly_revenue
            },
            "revenue_growth": revenue_growth,
            "most_profitable_themes": most_profitable_themes,
            "most_popular_genres": most_popular_genres
        }
        
    async def get_user_stats(self, db: AsyncSession, days: int = 30) -> Dict:
        """Статистика по пользователям"""
        # Новые пользователи за период
        period_start = datetime.now(timezone.utc) - timedelta(days=days)
        new_users_result = await db.execute(
            select(func.count(UserModel.id))
            .where(UserModel.created_at >= period_start)
        )
        new_users_period = new_users_result.scalar() or 0

        # Постоянные клиенты (пользователи с >1 заказом)
        returning_users_result = await db.execute(
            select(func.count(UserModel.id)).select_from(
                select(UserModel.id)
                .join(OrderModel)
                .group_by(UserModel.id)
                .having(func.count(OrderModel.id) > 1)
                .subquery()
            )
        )
        returning_users = returning_users_result.scalar() or 0

        # Всего пользователей с заказами
        total_users_with_orders_result = await db.execute(
            select(func.count(func.distinct(OrderModel.user_id)))
        )
        total_users_with_orders = total_users_with_orders_result.scalar() or 0

        returning_customers = returning_users / total_users_with_orders if total_users_with_orders > 0 else 0

        return {
            "new_users_period": new_users_period,
            "returning_customers": returning_customers
        }

    async def get_all_stats(self, db: AsyncSession, period: str = "month") -> Dict:
        """Получить всю статистику"""
        days_map = {"week": 7, "month": 30, "quarter": 90}
        days = days_map.get(period, 30)

        core_metrics = await self.get_core_metrics(db, days)
        order_stats = await self.get_order_stats(db, days)
        financial_stats = await self.get_financial_stats(db, days)
        user_stats = await self.get_user_stats(db, days)

        return {
            "core_metrics": core_metrics,
            "order_stats": order_stats,
            "financial_stats": financial_stats,
            "user_stats": user_stats,
            "period": period,
            "generated_at": datetime.now(timezone.utc)
        }


crud_stats = CRUDStats()