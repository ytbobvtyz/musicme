"""
Схемы для статистики
"""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class CoreMetrics(BaseModel):
    total_orders: int
    total_revenue: float
    average_order_value: float
    conversion_rate: float
    active_users: int


class TimelineItem(BaseModel):
    date: str
    count: int
    revenue: float


class OrderStats(BaseModel):
    orders_by_status: Dict[str, int]
    orders_timeline: List[TimelineItem]
    average_completion_time: float


class RevenueByPeriod(BaseModel):
    daily: float
    weekly: float
    monthly: float


class ThemeStats(BaseModel):
    theme: str
    revenue: float
    count: int


class GenreStats(BaseModel):
    genre: str
    count: int


class FinancialStats(BaseModel):
    revenue_by_period: RevenueByPeriod
    revenue_growth: float
    most_profitable_themes: List[ThemeStats]
    most_popular_genres: List[GenreStats]


class UserStats(BaseModel):
    new_users_period: int
    returning_customers: float


class StatsResponse(BaseModel):
    core_metrics: CoreMetrics
    order_stats: OrderStats
    financial_stats: FinancialStats
    user_stats: UserStats
    period: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)