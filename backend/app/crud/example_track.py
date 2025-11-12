"""
CRUD операции для примеров треков
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import List, Optional

from app.models.example_track import ExampleTrack as ExampleTrackModel
from app.schemas.example_track import ExampleTrackCreate, ExampleTrackUpdate


class CRUDExampleTrack:
    async def get_all(
        self, 
        db: AsyncSession, 
        genre: Optional[str] = None,
        theme: Optional[str] = None,
        active_only: bool = True
    ) -> List[ExampleTrackModel]:
        """Получить все примеры треков с загрузкой связей"""
        query = select(ExampleTrackModel).options(
            selectinload(ExampleTrackModel.theme),
            selectinload(ExampleTrackModel.genre)
        )
        
        if active_only:
            query = query.where(ExampleTrackModel.is_active == True)
            
        # TODO: Добавить фильтрацию по genre/theme когда перейдем на названия
        
        query = query.order_by(ExampleTrackModel.sort_order, ExampleTrackModel.created_at.desc())
        
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, track_id: UUID) -> Optional[ExampleTrackModel]:
        """Получить пример трека по ID с загрузкой связей"""
        result = await db.execute(
            select(ExampleTrackModel)
            .where(ExampleTrackModel.id == track_id)
            .options(
                selectinload(ExampleTrackModel.theme),
                selectinload(ExampleTrackModel.genre)
            )
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, track_data: ExampleTrackCreate) -> ExampleTrackModel:
        """Создать пример трека"""
        track = ExampleTrackModel(**track_data.dict())
        db.add(track)
        await db.commit()
        await db.refresh(track)
        return track

    async def update(
        self, 
        db: AsyncSession, 
        track_id: UUID, 
        track_update: ExampleTrackUpdate
    ) -> Optional[ExampleTrackModel]:
        """Обновить пример трека"""
        track = await self.get_by_id(db, track_id)
        if not track:
            return None
            
        update_data = track_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(track, field, value)
            
        await db.commit()
        await db.refresh(track)
        return track

    async def delete(self, db: AsyncSession, track_id: UUID) -> bool:
        """Удалить пример трека"""
        track = await self.get_by_id(db, track_id)
        if not track:
            return False
            
        await db.delete(track)
        await db.commit()
        return True


crud_example_track = CRUDExampleTrack()