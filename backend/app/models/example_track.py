# app/models/example_track.py
"""
Модель примера трека для демонстрации
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class ExampleTrack(Base):
    """Модель примера трека для главной страницы"""
    
    __tablename__ = "example_tracks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)  # Название примера
    genre = Column(String, nullable=False, index=True)  # Жанр (поп, рок и т.д.)
    theme = Column(String, nullable=False, index=True)  # Тема (свадьба, день рождения и т.д.)
    description = Column(Text, nullable=True)  # Описание примера
    
    # Новые поля для хранения файлов
    audio_filename = Column(String, nullable=True)  # Имя файла в хранилище
    audio_size = Column(Integer, nullable=True)  # Размер файла в байтах
    audio_mimetype = Column(String, nullable=True)  # MIME type
    
    # Старые поля для обратной совместимости
    audio_url = Column(String, nullable=True)  # URL аудио файла
    suno_id = Column(String, nullable=True)  # ID в Suno (если есть)
    
    duration = Column(Integer, nullable=True)  # Длительность в секундах
    is_active = Column(Boolean, default=True, nullable=False)  # Активен ли пример
    sort_order = Column(Integer, default=0, nullable=False)  # Порядок сортировки
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<ExampleTrack(id={self.id}, title={self.title}, genre={self.genre})>"