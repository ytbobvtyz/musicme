# app/crud/revision.py
"""
CRUD операции для комментариев правок
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID

from app.models.revision import RevisionComment as RevisionCommentModel
from app.schemas.revision import RevisionCommentCreate

class CRUDRevisionComment:
    async def create(
        self, 
        db: AsyncSession, 
        comment_data: RevisionCommentCreate, 
        user_id: UUID,
        revision_number: int
    ) -> RevisionCommentModel:
        """Создать новый комментарий правки"""
        comment = RevisionCommentModel(
            order_id=comment_data.order_id,
            user_id=user_id,
            comment=comment_data.comment,
            revision_number=revision_number
        )
        
        db.add(comment)
        await db.commit()
        await db.refresh(comment)
        return comment

    async def get_by_order(
        self, 
        db: AsyncSession, 
        order_id: UUID
    ) -> List[RevisionCommentModel]:
        """Получить все комментарии правок для заказа"""
        result = await db.execute(
            select(RevisionCommentModel)
            .where(RevisionCommentModel.order_id == order_id)
            .options(selectinload(RevisionCommentModel.user))
            .order_by(RevisionCommentModel.revision_number.desc(), RevisionCommentModel.created_at.desc())
        )
        return result.scalars().all()

    async def get_by_revision(
        self, 
        db: AsyncSession, 
        order_id: UUID,
        revision_number: int
    ) -> List[RevisionCommentModel]:
        """Получить комментарии конкретной правки"""
        result = await db.execute(
            select(RevisionCommentModel)
            .where(
                RevisionCommentModel.order_id == order_id,
                RevisionCommentModel.revision_number == revision_number
            )
            .options(selectinload(RevisionCommentModel.user))
            .order_by(RevisionCommentModel.created_at.asc())
        )
        return result.scalars().all()

    async def get_last_revision_number(
        self, 
        db: AsyncSession, 
        order_id: UUID
    ) -> int:
        """Получить номер последней правки для заказа"""
        result = await db.execute(
            select(RevisionCommentModel.revision_number)
            .where(RevisionCommentModel.order_id == order_id)
            .order_by(RevisionCommentModel.revision_number.desc())
            .limit(1)
        )
        last_revision = result.scalar()
        return last_revision or 0

crud_revision_comment = CRUDRevisionComment()