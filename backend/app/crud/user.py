"""
CRUD-утилиты для работы с пользователями
"""
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_id(db: AsyncSession, user_id) -> Optional[User]:
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def upsert_user_by_email(
    db: AsyncSession,
    *,
    email: str,
    name: Optional[str] = None,
    avatar_url: Optional[str] = None,
) -> User:
    user = await get_user_by_email(db, email)
    if user:
        # Обновляем базовую информацию при необходимости
        updated = False
        if name and user.name != name:
            user.name = name
            updated = True
        if avatar_url and user.avatar_url != avatar_url:
            user.avatar_url = avatar_url
            updated = True
        if updated:
            await db.flush()
        return user
    # Создаем нового пользователя
    user = User(email=email, name=name, avatar_url=avatar_url)
    db.add(user)
    await db.flush()
    return user


