"""
Endpoints для работы с треками
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import FileResponse

from app.core.database import get_db
from app.schemas.track import Track
# from app.schemas.user import User as UserSchema
# from app.core.deps import get_current_user
from app.crud.track import crud_track
from app.crud.order import crud_order
from app.core.file_storage import file_storage

router = APIRouter()


@router.get("/{track_id}", response_model=Track)
async def get_track(
    track_id: UUID,
    db: AsyncSession = Depends(get_db),
    # TODO: Добавить зависимость для получения текущего пользователя
):
    """
    Получить информацию о треке
    """
    # TODO: Реализовать получение трека с проверкой прав доступа
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Получение трека еще не реализовано"
    )

@router.get("/{track_id}/audio")
async def get_track_audio(
    track_id: UUID,
    db: AsyncSession = Depends(get_db)
    # УБРАТЬ: current_user: UserSchema = Depends(get_current_user)
):
    """
    Получить аудиофайл трека (публичный эндпоинт)
    """
    track = await crud_track.get_by_id(db, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Трек не найден")
    
    # Проверяем что трек готов
    if track.status != 'ready':
        raise HTTPException(status_code=404, detail="Трек еще не готов")
    
    if not track.audio_filename:
        raise HTTPException(status_code=404, detail="Аудиофайл не найден")
    
    file_path = file_storage.get_file_path(track.audio_filename, "audio")
    
    if not file_path:
        raise HTTPException(status_code=404, detail="Аудиофайл не найден на сервере")
    
    return FileResponse(
        file_path,
        media_type=track.audio_mimetype or "audio/mpeg",
        filename=f"{track.title or 'track'}.mp3"
    )