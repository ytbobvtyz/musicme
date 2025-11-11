"""
CRUD операции для примеров треков
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from uuid import UUID

from app.models.example_track import ExampleTrack
from app.schemas.example_track import ExampleTrackCreate, ExampleTrackUpdate


class CRUDExampleTrack:
    async def create(self, db: AsyncSession, track_data: ExampleTrackCreate) -> ExampleTrack:
        track = ExampleTrack(**track_data.dict())
        db.add(track)
        await db.commit()
        await db.refresh(track)
        return track

    async def get_by_id(self, db: AsyncSession, track_id: UUID) -> Optional[ExampleTrack]:
        result = await db.execute(select(ExampleTrack).where(ExampleTrack.id == track_id))
        return result.scalar_one_or_none()

    async def get_all(
        self, 
        db: AsyncSession, 
        genre: Optional[str] = None,
        theme: Optional[str] = None,
        active_only: bool = True
    ) -> List[ExampleTrack]:
        query = select(ExampleTrack)
        
        if active_only:
            query = query.where(ExampleTrack.is_active == True)
        if genre:
            query = query.where(ExampleTrack.genre == genre)
        if theme:
            query = query.where(ExampleTrack.theme == theme)
            
        query = query.order_by(ExampleTrack.sort_order, ExampleTrack.created_at.desc())
        
        result = await db.execute(query)
        return result.scalars().all()

    async def update(
        self, 
        db: AsyncSession, 
        track_id: UUID, 
        update_data: ExampleTrackUpdate
    ) -> Optional[ExampleTrack]:
        track = await self.get_by_id(db, track_id)
        if not track:
            return None
            
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(track, field, value)
            
        await db.commit()
        await db.refresh(track)
        return track

    async def delete(self, db: AsyncSession, track_id: UUID) -> bool:
        track = await self.get_by_id(db, track_id)
        if not track:
            return False
            
        await db.delete(track)
        await db.commit()
        return True


crud_example_track = CRUDExampleTrack()