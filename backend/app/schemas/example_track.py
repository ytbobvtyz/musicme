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
    theme: str
    description: Optional[str] = None
    audio_url: str
    suno_id: Optional[str] = None
    duration: Optional[int] = None
    sort_order: int = 0
    theme_id: UUID
    genre_id: UUID

class ExampleTrackCreate(ExampleTrackBase):  # ⬅️ ДОБАВЬ ЭТОТ КЛАСС
    pass


class ExampleTrackUpdate(BaseModel):
    title: Optional[str] = None
    genre: Optional[str] = None
    theme: Optional[str] = None
    description: Optional[str] = None
    audio_url: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class ExampleTrack(ExampleTrackBase):
    id: UUID
    is_active: bool
    created_at: datetime

    theme: Optional[Theme] = None
    genre: Optional[Genre] = None

    class Config:
        from_attributes = True