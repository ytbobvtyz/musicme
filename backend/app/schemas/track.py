"""
Схемы трека
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, HttpUrl


class TrackBase(BaseModel):
    """Базовая схема трека"""
    title: Optional[str] = None
    suno_id: Optional[str] = None
    preview_url: Optional[HttpUrl] = None
    full_url: Optional[HttpUrl] = None
    duration: Optional[int] = None


class TrackCreate(TrackBase):
    """Схема для создания трека"""
    order_id: UUID
    suno_id: str
    audio_url: str


class Track(TrackBase):
    """Схема трека"""
    id: UUID
    order_id: UUID
    is_paid: bool
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

