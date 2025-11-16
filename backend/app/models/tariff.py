from sqlalchemy import Column, String, Text, Integer, Boolean, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from datetime import datetime, timezone

from app.core.database import Base

class Tariff(Base):
    __tablename__ = "tariffs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Integer, nullable=False)
    original_price = Column(Integer)
    deadline_days = Column(Integer, nullable=False)
    rounds = Column(Integer, nullable=False)
    has_questionnaire = Column(Boolean, default=False)
    has_interview = Column(Boolean, default=False)
    features = Column(JSONB, default=[])  # Список фич
    badge = Column(String(50))
    popular = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None), onupdate=datetime.now(timezone.utc).replace(tzinfo=None))

    def __repr__(self):
        return f"<Tariff {self.code}: {self.name}>"