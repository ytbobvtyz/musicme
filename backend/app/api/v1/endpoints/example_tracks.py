"""
Публичные эндпоинты для примеров треков
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Response
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
    
    # ИСПРАВЛЕНИЕ: используем get_file_path вместо get_example_track_path
    file_path = file_storage.get_file_path(track.audio_filename, "examples")
    
    if not file_path:
        raise HTTPException(status_code=404, detail="Аудиофайл не найден на сервере")
    
    return FileResponse(
        file_path,
        media_type=track.audio_mimetype or "audio/mpeg",
        filename=f"{track.title}.mp3"
    )

@router.get("/example-tracks/{track_id}/cover")
async def get_example_track_cover(
    track_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Получить обложку примера трека
    """
    track = await crud_example_track.get_by_id(db, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Трек не найден")
    
    if not track.audio_filename:
        raise HTTPException(status_code=404, detail="Аудиофайл не найден")
    
    # Пытаемся получить обложку
    cover_filename = file_storage.get_or_create_cover(track.audio_filename, "examples")
    
    if cover_filename:
        cover_path = file_storage.get_cover_path(cover_filename)
        if cover_path:
            return FileResponse(
                cover_path,
                media_type="image/jpeg",
                filename=f"{track.title}_cover.jpg"
            )
    
    # Если обложки нет, возвращаем дефолтную обложку для темы
    return get_default_cover_for_theme(track.theme_id)

def get_default_cover_for_theme(theme_id: str):
    """Возвращает дефолтную обложку для темы"""
    # Можно создать папку static/default_covers с обложками для каждой темы
    # Пока возвращаем простой градиент через SVG
    svg_content = """
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#gradient)"/>
        <text x="200" y="200" text-anchor="middle" fill="white" font-family="Arial" font-size="24" dy=".3em">MusicMe</text>
    </svg>
    """
    
    return Response(content=svg_content, media_type="image/svg+xml")