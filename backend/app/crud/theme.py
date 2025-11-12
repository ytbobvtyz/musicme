"""
CRUD операции для тем
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.models.theme import Theme as ThemeModel

class CRUDTheme:
    async def get_all(self, db: AsyncSession) -> List[ThemeModel]:
        """Получить все активные темы"""
        result = await db.execute(
            select(ThemeModel)
            .where(ThemeModel.is_active == True)
            .order_by(ThemeModel.name)
        )
        return result.scalars().all()

crud_theme = CRUDTheme()