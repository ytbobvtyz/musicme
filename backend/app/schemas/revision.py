# app/schemas/revision.py
"""
Схемы для комментариев правок
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

class RevisionCommentBase(BaseModel):
    comment: str = Field(..., min_length=1, max_length=2000)

class RevisionCommentCreate(RevisionCommentBase):
    order_id: UUID

class RevisionComment(RevisionCommentBase):
    id: UUID
    order_id: UUID
    user_id: UUID
    revision_number: int
    created_at: datetime
    
    # Связи
    user: Optional[dict] = None
    
    class Config:
        from_attributes = True

class RevisionCommentWithUser(RevisionComment):
    """Схема с информацией о пользователе"""
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    
    class Config:
        from_attributes = True