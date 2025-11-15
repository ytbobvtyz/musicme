"""
Модель темы трека
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base

class Theme(Base):
    """Модель темы для треков (свадьба, день рождения и т.д.)"""
    
    __tablename__ = "themes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    
    def __repr__(self):
        return f"<Theme(id={self.id}, name={self.name})>"