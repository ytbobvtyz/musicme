"""
Публичные эндпоинты для примеров треков
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import os
from fastapi.responses import FileResponse

from app.core.database import get_db
from app.schemas.example_track import ExampleTrack
from app.crud.example_track import crud_example_track
from app.core.file_storage import file_storage

router = APIRouter()

@router.get("/example-tracks", response_model=List[ExampleTrack])
async def get_example_tracks(
    genre: Optional[str] = Query(None),
    theme: Optional[str] = Query(None),
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить все примеры треков (публичный эндпоинт)
    """
    tracks = await crud_example_track.get_all(db, genre=genre, theme=theme, active_only=active_only)
    return tracks

@router.get("/example-tracks/{track_id}/audio")
async def get_example_track_audio(
    track_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Получить аудиофайл примера трека
    """
    track = await crud_example_track.get_by_id(db, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Трек не найден")
    
    if not track.audio_filename:
        raise HTTPException(status_code=404, detail="Аудиофайл не найден")
    
    # Получаем файл из хранилища
    file_path = file_storage.get_example_track_path(track.audio_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Аудиофайл не найден на сервере")
    
    return FileResponse(
        file_path,
        media_type=track.audio_mimetype or "audio/mpeg",
        filename=f"{track.title}.mp3"
    )