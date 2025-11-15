"""
Схемы для тарифных планов
"""
from typing import List, Optional
from pydantic import BaseModel
from app.models.order import TariffPlan


class TariffFeature(BaseModel):
    """Фича тарифа"""
    text: str
    included: bool = True


class TariffPlanSchema(BaseModel):
    """Схема тарифного плана для фронтенда"""
    id: TariffPlan
    name: str
    description: str
    price: int
    original_price: Optional[int] = None
    deadline_days: int
    rounds: int
    has_questionnaire: bool
    has_interview: bool
    features: List[str]
    badge: Optional[str] = None
    popular: bool = False

    class Config:
        from_attributes = True


class TariffListResponse(BaseModel):
    """Ответ со списком тарифов"""
    tariffs: List[TariffPlanSchema]