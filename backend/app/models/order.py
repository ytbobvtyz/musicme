"""
Модель заказа
"""
import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from enum import Enum
from datetime import datetime, timedelta
from app.models.tariff_plan import TariffPlan

from app.core.database import Base

class OrderStatus(str, Enum):
    DRAFT = "draft"
    WAITING_INTERVIEW = "waiting_interview"
    IN_PROGRESS = "in_progress"
    READY_FOR_REVIEW = "ready_for_review"
    PAYMENT_PENDING = "payment_pending"
    PAID = "paid"
    READY_FOR_FINAL_REVIEW = "ready_for_final_review"
    IN_PROGRESS_FINAL_REVISION = "in_progress_final_revision"  # ⬅️ НОВЫЙ СТАТУС
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    theme_id = Column(UUID(as_uuid=True), ForeignKey("themes.id"), nullable=False, index=True)
    genre_id = Column(UUID(as_uuid=True), ForeignKey("genres.id"), nullable=False, index=True)
    
    # ⬇️ ДОБАВЛЯЕМ ПОЛЕ ПРОДЮСЕРА
    producer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    
    tariff_plan = Column(String, nullable=False, default=TariffPlan.BASIC, index=True)
    recipient_name = Column(String, nullable=False)
    occasion = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    preferences = Column(JSON, nullable=True)
    
    deadline_at = Column(DateTime, nullable=False)
    price = Column(Integer, nullable=False)
    
    status = Column(String, nullable=False, default=OrderStatus.DRAFT, index=True)
    rounds_remaining = Column(Integer, default=0, nullable=False)
    
    interview_link = Column(String, nullable=True)
    # payment_confirmed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    updated_at = Column(DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None), onupdate=datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    
    # Связи
    user = relationship("User", backref="orders", foreign_keys=[user_id])
    producer = relationship("User", foreign_keys=[producer_id])  # ← ДОБАВЛЯЕМ связь
    theme = relationship("Theme")
    genre = relationship("Genre")
    tracks = relationship("Track", back_populates="order", lazy="selectin", cascade="all, delete-orphan")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.deadline_at:
            self.deadline_at = self.calculate_deadline()
    
    def calculate_deadline(self):
        """Вычисляем дедлайн на основе тарифа"""
        deadline_days = {
            "basic": 1,
            "advanced": 2, 
            "premium": 3
        }
        days = deadline_days.get(self.tariff_plan, 1)
        return datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=days)