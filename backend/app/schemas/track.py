"""
Схемы трека
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel

from app.models.track import TrackStatus

class TrackBase(BaseModel):
    """Базовая схема трека"""
    title: Optional[str] = None
    suno_id: Optional[str] = None
    preview_url: Optional[str] = None  # ⬅️ String вместо HttpUrl
    full_url: Optional[str] = None     # ⬅️ String вместо HttpUrl
    duration: Optional[int] = None
    status: Optional[str] = None


class TrackCreate(TrackBase):
    """Схема для создания трека"""
    order_id: UUID
    suno_id: str
    audio_url: str

class TrackAdminCreate(BaseModel):
    """Схема для добавления существующих треков через админку"""
    suno_id: str
    preview_url: Optional[str] = None
    full_url: Optional[str] = None
    title: Optional[str] = None
    status: str = TrackStatus.READY
    
    class Config:
        from_attributes = True

class TrackUpdate(BaseModel):
    suno_id: Optional[str] = None
    preview_url: Optional[str] = None
    full_url: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None


class Track(TrackBase):
    """Схема трека"""
    id: UUID
    order_id: UUID
    is_paid: bool
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True