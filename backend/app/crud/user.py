"""
CRUD-утилиты для работы с пользователями
"""
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.models.user import User
from app.schemas.telegram import TelegramAuth


class CRUDUser:
    async def get_by_id(self, db: AsyncSession, user_id: UUID) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def upsert_user_by_email(
        self, db: AsyncSession,
        *,
        email: str,
        name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        registration_source: str = "oauth"
    ) -> User:
        user = await self.get_by_email(db, email)
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
                await db.commit()
                await db.refresh(user)
            return user
        # Создаем нового пользователя
        user = User(
            email=email, 
            name=name, 
            avatar_url=avatar_url,
            registration_source=registration_source
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def get_by_telegram_id(self, db: AsyncSession, telegram_id: int) -> Optional[User]:
        """Найти пользователя по Telegram ID"""
        result = await db.execute(
            select(User).where(User.telegram_id == telegram_id)
        )
        return result.scalar_one_or_none()

    async def create_telegram_user(self, db: AsyncSession, telegram_data: TelegramAuth) -> User:
        """Создать пользователя из Telegram данных"""
        user = User(
            telegram_id=telegram_data.id,
            name=f"{telegram_data.first_name} {telegram_data.last_name or ''}".strip(),
            email=f"telegram_{telegram_data.id}@musicme.ru",
            telegram_username=telegram_data.username,
            avatar_url=telegram_data.photo_url,
            registration_source="telegram"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def update_telegram_data(self, db: AsyncSession, user_id: UUID, telegram_data: TelegramAuth) -> User:
        """Обновить данные пользователя из Telegram"""
        user = await self.get_by_id(db, user_id)
        if user:
            user.name = f"{telegram_data.first_name} {telegram_data.last_name or ''}".strip()
            user.telegram_username = telegram_data.username
            user.avatar_url = telegram_data.photo_url
            await db.commit()
            await db.refresh(user)
        return user

    # ⬇️ ПЕРЕМЕЩАЕМ МЕТОДЫ ВНУТРЬ КЛАССА
    async def get_producers(self, db: AsyncSession) -> List[User]:
        """Получить всех продюсеров"""
        result = await db.execute(
            select(User).where(User.is_producer == True)
        )
        return result.scalars().all()

    async def get_by_producer_id(self, db: AsyncSession, producer_id: UUID) -> Optional[User]:
        """Получить продюсера по ID с проверкой is_producer"""
        result = await db.execute(
            select(User).where(
                User.id == producer_id,
                User.is_producer == True
            )
        )
        return result.scalar_one_or_none()

    async def get_by_registration_source(
        self, 
        db: AsyncSession, 
        source: str
    ) -> List[User]:
        """Получить пользователей по источнику регистрации"""
        result = await db.execute(
            select(User).where(User.registration_source == source)
        )
        return result.scalars().all()


# Создаем экземпляр CRUDUser
crud_user = CRUDUser()

# Обратная совместимость со старыми импортами
upsert_user_by_email = crud_user.upsert_user_by_email