"""
Модель пользователя
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class User(Base):
    """Модель пользователя"""
     
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    telegram_id = Column(BigInteger, unique=True, nullable=True, index=True)
    telegram_username = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_producer = Column(Boolean, default=False, nullable=False)    


    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"

