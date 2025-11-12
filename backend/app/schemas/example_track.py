"""
Схемы для примеров треков
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from app.schemas.theme import Theme
from app.schemas.genre import Genre


class ExampleTrackBase(BaseModel):
    title: str
    description: Optional[str] = None
    theme_id: UUID  # ← ИСПРАВЛЕНО: убрали дублирование
    genre_id: UUID  # ← ИСПРАВЛЕНО: убрали дублирование


class ExampleTrackCreate(ExampleTrackBase):
    pass


class ExampleTrackUpdate(BaseModel):
    title: Optional[str] = None
    theme_id: Optional[UUID] = None  # ← ИСПРАВЛЕНО: теперь UUID
    genre_id: Optional[UUID] = None  # ← ИСПРАВЛЕНО: теперь UUID
    description: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class ExampleTrack(ExampleTrackBase):
    id: UUID
    is_active: bool
    created_at: datetime

    # Связи
    theme: Optional[Theme] = None
    genre: Optional[Genre] = None

    # Audio fields
    audio_filename: Optional[str] = None
    audio_size: Optional[int] = None
    audio_mimetype: Optional[str] = None
    audio_url: Optional[str] = None  # ← для обратной совместимости
    suno_id: Optional[str] = None    # ← для обратной совместимости
    duration: Optional[int] = None   # ← для обратной совместимости
    sort_order: int = 0              # ← для обратной совместимости

    class Config:
        from_attributes = True