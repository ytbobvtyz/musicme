"""
CRUD операции для жанров
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.models.genre import Genre as GenreModel

class CRUDGenre:
    async def get_all(self, db: AsyncSession) -> List[GenreModel]:
        """Получить все активные жанры"""
        result = await db.execute(
            select(GenreModel)
            .where(GenreModel.is_active == True)
            .order_by(GenreModel.name)
        )
        return result.scalars().all()

crud_genre = CRUDGenre()