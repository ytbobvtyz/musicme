"""
Модель заказа
"""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from enum import Enum
from datetime import datetime, timedelta
from app.models.tariff_plan import TariffPlan
from app.core.tariffs import get_tariff_deadline_days

from app.core.database import Base

class OrderStatus(str, Enum):
    """Статусы заказа"""
    DRAFT = "draft"
    WAITING_INTERVIEW = "waiting_interview"
    IN_PROGRESS = "in_progress"
    READY_FOR_REVIEW = "ready_for_review"  # ← preview готов
    READY = "ready"
    PAID = "paid"  # ← используем статус вместо is_paid
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    theme_id = Column(UUID(as_uuid=True), ForeignKey("themes.id"), nullable=False, index=True)
    genre_id = Column(UUID(as_uuid=True), ForeignKey("genres.id"), nullable=False, index=True)
    
    # ⬇️ НОВЫЕ ПОЛЯ ДЛЯ ТАРИФОВ И ГОСТЕЙ
    tariff_plan = Column(String, nullable=False, default=TariffPlan.BASIC, index=True)
    guest_email = Column(String, nullable=True, index=True)  # для гостевых заказов
    
    recipient_name = Column(String, nullable=False)
    occasion = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    preferences = Column(JSON, nullable=True)  # ← УЖЕ ЕСТЬ в вашей схеме
    
    # ⬇️ ОДНО ПОЛЕ ДЛЯ ДЕДЛАЙНА + ЦЕНА
    deadline_at = Column(DateTime, nullable=False)    # вычисляемое поле
    price = Column(Integer, nullable=False)  # цена в рублях
    
    # ⬇️ СТАТУС ЗАМЕНЯЕТ is_paid + поле для правок
    status = Column(String, nullable=False, default=OrderStatus.DRAFT, index=True)
    rounds_remaining = Column(Integer, default=0, nullable=False)  # оставшиеся правки
    
    interview_link = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Связи
    user = relationship("User", backref="orders")
    theme = relationship("Theme")
    genre = relationship("Genre")
    tracks = relationship("Track", back_populates="order", lazy="selectin", cascade="all, delete-orphan")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Автоматически вычисляем дедлайн при создании на основе тарифа
        if not self.deadline_at:
            self.deadline_at = self.calculate_deadline()
    
    def calculate_deadline(self):
        """Вычисляем дедлайн на основе тарифа"""
        days = get_tariff_deadline_days(self.tariff_plan)
        return datetime.utcnow() + timedelta(days=days)
        
    @property
    def is_paid(self):
        """Виртуальное свойство для обратной совместимости"""
        return self.status == OrderStatus.PAID
    
    def __repr__(self):
        return f"<Order(id={self.id}, tariff={self.tariff_plan}, status={self.status})>"