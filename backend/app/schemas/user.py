"""
Схемы пользователя
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Базовая схема пользователя"""
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: bool = False
    is_producer: bool = False  # ← ДОБАВЛЯЕМ
    created_at: datetime

class UserCreate(UserBase):
    """Схема для создания пользователя"""
    pass


class User(UserBase):
    """Схема пользователя"""
    id: UUID
    # ⬇️ НОВОЕ ПОЛЕ ДЛЯ АНАЛИТИКИ
    registration_source: str = Field(default="oauth")
    
    class Config:
        from_attributes = True