# app/models/revision.py
"""
Модель комментариев к правкам
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class RevisionComment(Base):
    __tablename__ = "revision_comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Текст комментария
    comment = Column(Text, nullable=False)
    
    # Номер правки (1, 2, 3...) для группировки
    revision_number = Column(Integer, nullable=False)
    
    created_at = Column(DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    
    # Связи
    order = relationship("Order", backref="revision_comments")
    user = relationship("User")
    
    def __repr__(self):
        return f"<RevisionComment(order_id={self.order_id}, revision_number={self.revision_number})>"