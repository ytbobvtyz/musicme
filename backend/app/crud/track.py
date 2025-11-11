"""
CRUD операции для треков
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from uuid import UUID

from app.models.track import Track as TrackModel
from app.schemas.track import TrackCreate, TrackUpdate


class CRUDTrack:
    async def create(self, db: AsyncSession, track_data: TrackCreate, order_id: UUID) -> TrackModel:
        """Создать новый трек"""
        track = TrackModel(**track_data.dict(), order_id=order_id)
        db.add(track)
        await db.commit()
        await db.refresh(track)
        return track

    async def get_by_id(self, db: AsyncSession, track_id: UUID) -> Optional[TrackModel]:
        """Получить трек по ID"""
        result = await db.execute(select(TrackModel).where(TrackModel.id == track_id))
        return result.scalar_one_or_none()

    async def update(
        self, 
        db: AsyncSession, 
        track_id: UUID, 
        update_data: TrackUpdate
    ) -> Optional[TrackModel]:
        """Обновить трек"""
        track = await self.get_by_id(db, track_id)
        if not track:
            return None
            
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(track, field, value)
            
        await db.commit()
        await db.refresh(track)
        return track

    async def create_with_data(self, db: AsyncSession, track_data: dict) -> TrackModel:
        """Создать трек с готовыми данными (для админки)"""
        db_track = TrackModel(**track_data)
        db.add(db_track)
        await db.commit()
        await db.refresh(db_track)
        return db_track
        
crud_track = CRUDTrack()