# app/models/example_track.py
"""
Модель примера трека для демонстрации
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ExampleTrack(Base):
    """Модель примера трека для главной страницы"""
    
    __tablename__ = "example_tracks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    theme_id = Column(UUID(as_uuid=True), ForeignKey("themes.id"), nullable=False, index=True)  # ← НОВОЕ
    genre_id = Column(UUID(as_uuid=True), ForeignKey("genres.id"), nullable=False, index=True)  # ← НОВОЕ
    description = Column(Text, nullable=True)
    
    # Поля для хранения файлов
    audio_filename = Column(String, nullable=True)
    audio_size = Column(Integer, nullable=True)
    audio_mimetype = Column(String, nullable=True)
    
    # Старые поля для обратной совместимости
    audio_url = Column(String, nullable=True)
    suno_id = Column(String, nullable=True)
    
    duration = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    cover_filename = Column(String, nullable=True)
    # Связи
    theme = relationship("Theme")  # ← НОВОЕ
    genre = relationship("Genre")  # ← НОВОЕ
    
    def __repr__(self):
        return f"<ExampleTrack(id={self.id}, title={self.title})>"