"""
CRUD операции для треков
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import and_
from typing import Optional, List
from uuid import UUID

from app.models.track import Track as TrackModel
from app.schemas.track import TrackCreate, TrackUpdate


class CRUDTrack:
    async def create(
        self, 
        db: AsyncSession, 
        track_data: TrackCreate, 
        order_id: UUID,
        is_preview: bool = False
    ) -> TrackModel:
        """Создать новый трек"""
        track_dict = track_data.dict()
        track_dict['order_id'] = order_id
        track_dict['is_preview'] = is_preview
        
        # УДАЛЯЕМ статус из данных, если он есть
        track_dict.pop('status', None)
        
        track = TrackModel(**track_dict)
        db.add(track)
        await db.commit()
        await db.refresh(track)
        return track

    async def get_by_id(self, db: AsyncSession, track_id: UUID) -> Optional[TrackModel]:
        """Получить трек по ID"""
        result = await db.execute(
            select(TrackModel)
            .where(TrackModel.id == track_id)
            .options(selectinload(TrackModel.order))
        )
        return result.scalar_one_or_none()

    async def get_by_order(
        self, 
        db: AsyncSession, 
        order_id: UUID,
        is_preview: Optional[bool] = None
    ) -> List[TrackModel]:
        """Получить треки заказа с фильтрацией по preview"""
        query = select(TrackModel).where(TrackModel.order_id == order_id)
        
        if is_preview is not None:
            query = query.where(TrackModel.is_preview == is_preview)
            
        query = query.order_by(TrackModel.version.desc(), TrackModel.created_at.desc())
        
        result = await db.execute(query)
        return result.scalars().all()

    async def get_preview_track(self, db: AsyncSession, order_id: UUID) -> Optional[TrackModel]:
        """Получить preview трек заказа"""
        result = await db.execute(
            select(TrackModel)
            .where(
                and_(
                    TrackModel.order_id == order_id,
                    TrackModel.is_preview == True
                )
            )
            .order_by(TrackModel.version.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_final_tracks(self, db: AsyncSession, order_id: UUID) -> List[TrackModel]:
        """Получить финальные треки заказа (не preview)"""
        result = await db.execute(
            select(TrackModel)
            .where(
                and_(
                    TrackModel.order_id == order_id,
                    TrackModel.is_preview == False
                )
            )
            .order_by(TrackModel.version.desc())
        )
        return result.scalars().all()

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
        
        # УДАЛЯЕМ статус из данных обновления
        update_dict = update_data.dict(exclude_unset=True)
        update_dict.pop('status', None)
            
        for field, value in update_dict.items():
            setattr(track, field, value)
            
        await db.commit()
        await db.refresh(track)
        return track

    async def create_with_data(self, db: AsyncSession, track_data: dict) -> TrackModel:
        """Создать трек с готовыми данными (для админки)"""
        # УДАЛЯЕМ статус из данных
        track_data.pop('status', None)
        
        db_track = TrackModel(**track_data)
        db.add(db_track)
        await db.commit()
        await db.refresh(db_track)
        return db_track

    async def increment_version(
        self, 
        db: AsyncSession, 
        order_id: UUID,
        is_preview: bool = False
    ) -> int:
        """Получить следующую версию трека для заказа"""
        result = await db.execute(
            select(TrackModel.version)
            .where(
                and_(
                    TrackModel.order_id == order_id,
                    TrackModel.is_preview == is_preview
                )
            )
            .order_by(TrackModel.version.desc())
            .limit(1)
        )
        last_version = result.scalar()
        return (last_version or 0) + 1

    async def delete_tracks_by_order(
        self,
        db: AsyncSession,
        order_id: UUID,
        is_preview: Optional[bool] = None
    ) -> int:
        """Удалить треки заказа (для перегенерации)"""
        query = select(TrackModel).where(TrackModel.order_id == order_id)
        
        if is_preview is not None:
            query = query.where(TrackModel.is_preview == is_preview)
            
        result = await db.execute(query)
        tracks = result.scalars().all()
        
        deleted_count = 0
        for track in tracks:
            await db.delete(track)
            deleted_count += 1
            
        await db.commit()
        return deleted_count
        
crud_track = CRUDTrack()