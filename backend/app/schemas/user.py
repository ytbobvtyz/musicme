"""
Схемы пользователя
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Базовая схема пользователя"""
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    """Схема для создания пользователя"""
    pass


class User(UserBase):
    """Схема пользователя"""
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

