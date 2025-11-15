"""
Схемы трека
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.track import TrackStatus

class TrackBase(BaseModel):
    """Базовая схема трека"""
    title: Optional[str] = None
    suno_id: Optional[str] = None
    preview_url: Optional[str] = None
    full_url: Optional[str] = None
    duration: Optional[int] = None
    status: Optional[str] = None
    # ⬇️ НОВОЕ ПОЛЕ ДЛЯ PREVIEW
    is_preview: bool = Field(default=False)

class TrackCreate(TrackBase):
    """Схема для создания трека"""
    order_id: UUID
    suno_id: str

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
    is_preview: Optional[bool] = None

class Track(TrackBase):
    id: UUID
    order_id: UUID
    # ⬇️ УДАЛЯЕМ is_paid - оплачивается заказ, а не трек
    created_at: datetime
    
    # Audio fields
    audio_filename: Optional[str] = None
    audio_size: Optional[int] = None
    audio_mimetype: Optional[str] = None

    class Config:
        from_attributes = True

class TrackWithOrder(Track):
    """Схема трека с информацией о заказе для админки"""
    order: Optional[dict] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class TrackSimple(BaseModel):
    """Упрощенная схема трека для отладки"""
    id: UUID
    order_id: UUID
    title: Optional[str] = None
    status: str
    is_preview: bool = False
    audio_filename: Optional[str] = None
    audio_size: Optional[int] = None
    audio_mimetype: Optional[str] = None

    class Config:
        from_attributes = True