from typing import List, Optional, Any
from pydantic import BaseModel, validator
from uuid import UUID
from datetime import datetime  # ← ДОБАВЛЯЕМ ИМПОРТ

class TariffBase(BaseModel):
    code: str
    name: str
    description: str
    price: int
    original_price: Optional[int] = None
    deadline_days: int
    rounds: int
    has_questionnaire: bool
    has_interview: bool
    features: List[str] = []
    badge: Optional[str] = None
    popular: bool = False
    is_active: bool = True
    sort_order: int = 0

    @validator('features', pre=True)
    def validate_features(cls, v):
        """Валидация features - может быть список или JSON строка"""
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except:
                return []
        elif v is None:
            return []
        return v

class TariffCreate(TariffBase):
    pass

class TariffUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    original_price: Optional[int] = None
    features: Optional[List[str]] = None
    badge: Optional[str] = None
    popular: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class Tariff(TariffBase):
    id: UUID
    created_at: str  # ← ДОЛЖЕН БЫТЬ str, НЕ datetime
    updated_at: str  # ← ДОЛЖЕН БЫТЬ str, НЕ datetime

    # ⬇️ ДОБАВЛЯЕМ ВАЛИДАТОР ДЛЯ datetime ПРЕОБРАЗОВАНИЯ
    @validator('created_at', 'updated_at', pre=True)
    def convert_datetime_to_string(cls, v):
        """Конвертируем datetime в строку"""
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    class Config:
        from_attributes = True

class TariffListResponse(BaseModel):
    tariffs: List[Tariff]