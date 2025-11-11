"""
Модель музыкального трека
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class TrackStatus:
    """Статусы трека"""
    GENERATING = "generating"
    READY = "ready"
    ERROR = "error"


class Track(Base):
    """Модель музыкального трека"""
    
    __tablename__ = "tracks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    title = Column(String, nullable=True)
    suno_id = Column(String, nullable=True, index=True)
    preview_url = Column(String, nullable=True)
    full_url = Column(String, nullable=True)
    duration = Column(Integer, nullable=True)
    is_paid = Column(Boolean, default=False, nullable=False)
    status = Column(String, nullable=False, default=TrackStatus.GENERATING, index=True)
    
    # ДОБАВЬ ЭТИ ПОЛЯ:
    audio_filename = Column(String, nullable=True)
    audio_size = Column(Integer, nullable=True)
    audio_mimetype = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Связи
    order = relationship("Order", back_populates="tracks")
    
    def __repr__(self):
        return f"<Track(id={self.id}, order_id={self.order_id}, status={self.status})>"

