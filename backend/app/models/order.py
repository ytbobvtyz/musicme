"""
Модель заказа
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class OrderStatus:
    """Статусы заказа"""
    DRAFT = "draft"
    WAITING_INTERVIEW = "waiting_interview"
    IN_PROGRESS = "in_progress"
    READY = "ready"
    PAID = "paid"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Order(Base):
    """Модель заказа"""
    
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    theme = Column(String, nullable=False)  # свадьба, день_рождения, годовщина и т.д.
    genre = Column(String, nullable=False)  # поп, рок, хип-хоп и т.д.
    recipient_name = Column(String, nullable=False)
    occasion = Column(String, nullable=True)  # Описание повода
    details = Column(Text, nullable=True)  # Детали заказа
    preferences = Column(JSON, nullable=True)  # Дополнительные предпочтения
    status = Column(String, nullable=False, default=OrderStatus.DRAFT, index=True)
    interview_link = Column(String, nullable=True)
    estimated_time = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Связи
    user = relationship("User", backref="orders")
    tracks = relationship("Track", back_populates="order", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Order(id={self.id}, user_id={self.user_id}, status={self.status})>"

