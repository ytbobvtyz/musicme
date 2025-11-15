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


class UserCreate(UserBase):
    """Схема для создания пользователя"""
    pass


class User(UserBase):
    """Схема пользователя"""
    id: UUID
    created_at: datetime
    # ⬇️ НОВОЕ ПОЛЕ ДЛЯ АНАЛИТИКИ
    registration_source: str = Field(default="oauth")
    
    class Config:
        from_attributes = True