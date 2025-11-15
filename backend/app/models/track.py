"""
Модель музыкального трека
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class TrackStatus(str, Enum):  # ← Делаем Enum
    """Статусы трека"""
    GENERATING = "generating"
    READY_FOR_REVIEW = "ready_for_review"  # ← preview готов
    READY = "ready"
    NEEDS_REVISION = "needs_revision"  # ← требуется правка
    ERROR = "error"

class Track(Base):
    __tablename__ = "tracks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    version = Column(Integer, default=1, nullable=False)  # версия трека (1, 2, 3...)
    is_preview = Column(Boolean, default=False, nullable=False)  # preview 60 сек или полная
    title = Column(String, nullable=True)
    suno_id = Column(String, nullable=True, index=True)
    preview_url = Column(String, nullable=True)
    full_url = Column(String, nullable=True)
    duration = Column(Integer, nullable=True)
    audio_filename = Column(String, nullable=True)
    audio_size = Column(Integer, nullable=True)
    audio_mimetype = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Связи
    order = relationship("Order", back_populates="tracks")
    
    def __repr__(self):
        return f"<Track(id={self.id}, version={self.version}, is_preview={self.is_preview})>"