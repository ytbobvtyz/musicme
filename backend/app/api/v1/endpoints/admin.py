"""
Админские эндпоинты
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from sqlalchemy.orm import selectinload
from fastapi.responses import FileResponse, JSONResponse
import os
from sqlalchemy.orm import selectinload, joinedload
from datetime import datetime, timezone, timedelta
import traceback
import logging

from sqlalchemy import and_
from app.core.database import get_db
from app.core.deps import get_current_admin
from app.schemas.order import Order, AdminOrder, OrderWithUser, OrderDetail
from app.schemas.track import Track, TrackWithOrder, TrackAdminCreate, TrackSimple
from app.schemas.example_track import ExampleTrack, ExampleTrackCreate, ExampleTrackUpdate
from app.models.user import User as UserModel
from app.models.track import Track as TrackModel  # ⬅️ ДОБАВЬ ЭТОТ ИМПОРТ
from app.models.order import Order as OrderModel, OrderStatus   # ⬅️ И ЭТОТ ТОЖЕ
from app.crud.track import crud_track
from app.crud.example_track import crud_example_track
from app.core.file_storage import file_storage
from app.models.example_track import ExampleTrack as ExampleTrackModel
from app.schemas.stats import StatsResponse
from app.crud.stats import crud_stats
from app.crud.order import crud_order
from app.schemas.user import User as UserSchema
from app.crud.user import upsert_user_by_email, crud_user
from app.services.order_status_service import order_status_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/tracks/{track_id}/audio-public")
async def get_track_audio_public(
    track_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Получить аудио файл трека (публичный доступ)
    """
    try:
        # Находим трек
        track_query = select(TrackModel).where(TrackModel.id == track_id)
        track_result = await db.execute(track_query)
        track = track_result.scalar_one_or_none()
        
        if not track or not track.audio_filename:
            raise HTTPException(status_code=404, detail="Трек или аудио файл не найден")
        
        file_path = file_storage.get_file_path(track.audio_filename, "audio")
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Аудио файл не найден на диске")
        
        return FileResponse(
            file_path,
            media_type=track.audio_mimetype or "audio/mpeg",
            filename=f"{track.title or 'track'}.mp3"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tracks-debug-simple")
async def get_tracks_debug_simple(
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Отладочный эндпоинт - возвращает простой JSON
    """
    try:
        from sqlalchemy import text
        
        # ИСПРАВЛЕННЫЙ SQL - УДАЛИТЬ status из SELECT
        result = await db.execute(text("""
            SELECT id, order_id, title, audio_filename, audio_size, audio_mimetype, created_at, is_preview
            FROM tracks 
            ORDER BY created_at DESC
        """))
        rows = result.fetchall()
        
        tracks_data = []
        for row in rows:
            tracks_data.append({
                "id": str(row[0]),
                "order_id": str(row[1]),
                "title": row[2],
                "audio_filename": row[3],
                "audio_size": row[4],
                "audio_mimetype": row[5],
                "created_at": row[6].isoformat() if row[6] else None,
                "is_preview": row[7]  # ← ДОБАВИТЬ is_preview
            })
        
        return tracks_data
        
    except Exception as e:
        print(f"Error in tracks-debug-simple: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {"error": str(e)}
        
# ===== Эндпоинт для гарантированного получения всей информации по трекам =====
@router.get("/tracks-detailed", response_model=List[TrackSimple])
async def get_tracks_detailed(
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Получить треки (упрощенная версия для отладки)
    """
    try:
        print("=== TRACKS DETAILED SIMPLIFIED ===")
        
        query = select(TrackModel)
        result = await db.execute(query)
        tracks = result.scalars().all()
        
        print(f"Found {len(tracks)} tracks")
        
        # Возвращаем только основные поля
        return tracks
        
    except Exception as e:
        print(f"Error in tracks-detailed: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
# ===== Эндпоинты для загрукзи файлов =====

@router.post("/orders/{order_id}/tracks/upload", response_model=Track)
async def upload_track_to_order(
    order_id: UUID,
    file: UploadFile = File(...),
    title: Optional[str] = None,
    is_preview: bool = Form(False),  # ← ДОБАВИТЬ параметр
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Загрузить MP3 файл для заказа (админ)
    """
    # Проверяем заказ
    order_query = select(OrderModel).where(OrderModel.id == order_id)
    order_result = await db.execute(order_query)
    order = order_result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    # Сохраняем файл
    file_info = await file_storage.save_audio_file(file, "audio")
    
    # Создаем трек
    db_track = TrackModel(
        order_id=order_id,
        title=title or file_info["original_name"],
        audio_filename=file_info["filename"],
        audio_size=file_info["size"],
        audio_mimetype=file_info["mimetype"],
        is_preview=is_preview  # ← ИСПОЛЬЗОВАТЬ is_preview вместо status
    )
    db.add(db_track)
    await db.commit()
    await db.refresh(db_track)
    
    return db_track

# ===== Эндпоинты для заказов =====

@router.get("/orders", response_model=List[OrderWithUser])
async def get_all_orders(
    status: Optional[str] = Query(None),
    tariff: Optional[str] = Query(None),  # ⬅️ НОВЫЙ ПАРАМЕТР
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Получить все заказы (админ) с фильтрацией по статусу и тарифу
    """
    orders = await crud_order.get_all(
        db, 
        status_filter=status,
        tariff_filter=tariff,  # ⬅️ ПЕРЕДАЕМ ФИЛЬТР
        limit=limit, 
        offset=offset
    )
    return orders

@router.get("/orders/{order_id}", response_model=OrderDetail)
async def get_order_admin(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Получить детальную информацию о заказе (админ)
    """
    order = await crud_order.get_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return order


@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: UUID,
    status: str,
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Изменить статус заказа (админ)
    """
    order = await crud_order.get_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    # TODO: Добавить валидацию статуса
    order.status = status
    await db.commit()
    await db.refresh(order)
    
    return {"message": "Статус заказа обновлен", "order_id": order_id, "new_status": status}


# ===== Эндпоинты для треков =====

@router.get("/tracks", response_model=List[TrackWithOrder])
async def get_all_tracks(
    order_id: Optional[UUID] = Query(None),
    # УДАЛИТЬ параметр status: Optional[str] = Query(None),
    is_preview: Optional[bool] = Query(None),  # ← ДОБАВИТЬ фильтр по is_preview
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Получить все треки (админ) с информацией о заказах
    """
    query = select(TrackModel).options(
        selectinload(TrackModel.order).selectinload(OrderModel.user),
        selectinload(TrackModel.order).selectinload(OrderModel.theme),
        selectinload(TrackModel.order).selectinload(OrderModel.genre)
    )
    
    if order_id:
        query = query.where(TrackModel.order_id == order_id)
    if is_preview is not None:  # ← ЗАМЕНИТЬ status на is_preview
        query = query.where(TrackModel.is_preview == is_preview)
        
    result = await db.execute(query)
    tracks = result.unique().scalars().all()
    return tracks


@router.post("/orders/{order_id}/tracks", response_model=Track)
async def add_track_to_order(
    order_id: UUID,
    track_data: TrackAdminCreate,  # ← ОБНОВИТЬ СХЕМУ (убрать status)
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    order = await crud_order.get_by_id(db, order_id)
    # Создаем трек БЕЗ статуса
    db_track = TrackModel(
        order_id=order_id,
        suno_id=track_data.suno_id,
        preview_url=track_data.preview_url,
        full_url=track_data.full_url,
        title=track_data.title,
        is_preview=track_data.is_preview  # ← ВАЖНО: указываем preview или полная версия
    )
    db.add(db_track)
    await db.commit()
    
    # Обновляем статус заказа
    await order_status_service.on_tracks_changed(db, order)
    
    return db_track


@router.delete("/tracks/{track_id}")
async def delete_track_admin(
    track_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Удалить трек (админ) с удалением файла
    """
    try:
        # Сначала находим трек чтобы получить имя файла
        track_query = select(TrackModel).where(TrackModel.id == track_id)
        track_result = await db.execute(track_query)
        track = track_result.scalar_one_or_none()
        
        if not track:
            raise HTTPException(status_code=404, detail="Трек не найден")
        
        print(f"=== DELETING TRACK {track_id} ===")
        print(f"Track title: {track.title}")
        print(f"Audio filename: {track.audio_filename}")
        
        # Удаляем файл с диска если он существует
        file_deleted = False
        if track.audio_filename:
            try:
                file_deleted = file_storage.delete_file(track.audio_filename, "audio")
                print(f"File deletion result: {file_deleted}")
            except Exception as e:
                print(f"Warning: Error deleting file: {e}")
                # Продолжаем удаление записи из БД даже если файл не удалился
        else:
            print("No audio file to delete")
        
        # Удаляем запись из БД
        result = await db.execute(
            delete(TrackModel).where(TrackModel.id == track_id)
        )
        await db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Трек не найден в БД")
        
        # Формируем сообщение в зависимости от результата
        if file_deleted:
            message = "Трек и аудио файл удалены"
        else:
            message = "Трек удален (файл не найден или не удален)"
            
        print("Track deleted successfully")
        return {"message": message}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting track: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Ошибка при удалении трека: {str(e)}")

# ===== Эндпоинты для примеров треков =====

@router.get("/example-tracks", response_model=List[ExampleTrack])
async def get_example_tracks_admin(
    # Временно оставляем старые параметры для обратной совместимости
    genre: Optional[str] = Query(None),
    theme: Optional[str] = Query(None),
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Получить все примеры треков (админ) с загрузкой связей
    """
    # Используем обновленный CRUD с загрузкой связей
    tracks = await crud_example_track.get_all(db, genre=genre, theme=theme, active_only=active_only)
    return tracks

@router.post("/example-tracks", response_model=ExampleTrack)
async def create_example_track(
    track_data: ExampleTrackCreate,
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Создать пример трека (админ)
    """
    track = await crud_example_track.create(db, track_data)
    return track


@router.patch("/example-tracks/{track_id}", response_model=ExampleTrack)
async def update_example_track(
    track_id: UUID,
    track_update: ExampleTrackUpdate,
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Обновить пример трека (админ)
    """
    track = await crud_example_track.update(db, track_id, track_update)
    if not track:
        raise HTTPException(status_code=404, detail="Пример трека не найден")
    return track



@router.post("/example-tracks/upload", response_model=ExampleTrack)
async def upload_example_track(
    file: UploadFile = File(...),
    title: str = Form(...),
    theme_id: str = Form(...),
    genre_id: str = Form(...),
    description: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Загрузить пример трека (админ) с новой структурой
    """
    # Валидируем UUID
    from uuid import UUID
    try:
        theme_uuid = UUID(theme_id)
        genre_uuid = UUID(genre_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Неверный формат theme_id или genre_id")
    
    # Сохраняем файл
    file_info = await file_storage.save_audio_file(file, "examples")
    
    # Создаем запись в БД с новой структурой
    db_track = ExampleTrackModel(
        title=title,
        theme_id=theme_uuid,
        genre_id=genre_uuid,
        description=description,
        audio_filename=file_info["filename"],
        audio_size=file_info["size"],
        audio_mimetype=file_info["mimetype"],
        is_active=True
    )
    
    db.add(db_track)
    await db.commit()
    await db.refresh(db_track)
    
    # После сохранения файла извлекаем обложку (ДЕЛАЕМ ПОСЛЕ СОЗДАНИЯ ЗАПИСИ)
    cover_filename = file_storage.extract_cover_from_mp3(file_info["filename"], "examples")
    if cover_filename:
        db_track.cover_filename = cover_filename
        await db.commit()  # ← ВАЖНО: коммитим изменения с обложкой
        await db.refresh(db_track)
    
    # Загружаем связи для возврата полных данных
    await db.refresh(db_track, ['theme', 'genre'])
    
    return db_track

@router.get("/example-tracks/{track_id}/audio")
async def get_example_track_audio(
    track_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Получить аудио файл примера трека (доступно без авторизации)
    """
    track = await crud_example_track.get_by_id(db, track_id)
    if not track or not track.audio_filename:
        raise HTTPException(status_code=404, detail="Трек или аудио файл не найден")
    
    file_path = file_storage.get_file_path(track.audio_filename, "examples")
    if not file_path:
        raise HTTPException(status_code=404, detail="Аудио файл не найден")
    
    return FileResponse(
        file_path,
        media_type=track.audio_mimetype or "audio/mpeg",
        filename=f"{track.title}.mp3"
    )

@router.delete("/example-tracks/{track_id}")
async def delete_example_track(
    track_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Удалить пример трека (админ)
    """
    track = await crud_example_track.get_by_id(db, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Пример трека не найден")
    
    # Удаляем файл если есть
    if track.audio_filename:
        file_storage.delete_file(track.audio_filename, "examples")
    
    # Удаляем запись из БД через CRUD
    await crud_example_track.delete(db, track_id)
    
    return {"message": "Пример трека удален"}

@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Получить статистику для админки
    """
    # TODO: Реализовать сбор статистики
    return {
        "total_orders": 0,
        "orders_in_progress": 0,
        "orders_completed": 0,
        "total_users": 0
    }

@router.delete("/orders/{order_id}")
async def delete_order_admin(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Удалить заказ (админ) с каскадным удалением треков
    """
    try:
        # Находим заказ
        order_query = select(OrderModel).where(OrderModel.id == order_id)
        order_result = await db.execute(order_query)
        order = order_result.scalar_one_or_none()
        
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        # Удаляем связанные треки и их файлы
        tracks_query = select(TrackModel).where(TrackModel.order_id == order_id)
        tracks_result = await db.execute(tracks_query)
        tracks = tracks_result.scalars().all()
        
        # Удаляем файлы треков
        for track in tracks:
            if track.audio_filename:
                try:
                    file_storage.delete_file(track.audio_filename, "audio")
                except Exception as e:
                    print(f"Warning: Error deleting track file {track.audio_filename}: {e}")
        
        # Удаляем заказ (треки удалятся каскадно из-за cascade="all, delete-orphan")
        await db.delete(order)
        await db.commit()
        
        return {"message": "Заказ и связанные треки удалены"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print(f"Error deleting order: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка при удалении заказа: {str(e)}")

# Статистика

# 

@router.get("/stats", response_model=StatsResponse)
async def get_admin_stats(
    period: str = "month",
    db: AsyncSession = Depends(get_db),
    admin: UserModel = Depends(get_current_admin)
):
    """
    Получить статистику для админки (реальная реализация)
    """
    try:
        from app.crud.stats import crud_stats
        
        stats = await crud_stats.get_all_stats(db, period)
        return stats
        
    except Exception as e:
        logger.error(f"Error generating stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при генерации статистики: {str(e)}"
        )

@router.get("/producers")
async def get_producers(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_admin)
):
    """
    Получить список всех продюсеров
    """
    try:
        print("🔍 Fetching producers...")
        producers = await crud_user.get_producers(db)  # ← вызываем как метод экземпляра
        print(f"🔍 Found {len(producers)} producers")
        
        return [UserSchema.model_validate(producer) for producer in producers]
        
    except Exception as e:
        print(f"❌ Error fetching producers: {str(e)}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении продюсеров: {str(e)}"
        )


@router.post("/orders/{order_id}/assign")
async def assign_producer(
    order_id: UUID,
    assign_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_admin)
):
    """
    Назначить продюсера на заказ
    """
    try:
        producer_id = assign_data.get("producer_id")
        if not producer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="producer_id обязателен"
            )
        
        print(f"🔍 Admin assigning producer {producer_id} to order {order_id}")
        
        # Получаем заказ
        order = await crud_order.get(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Заказ не найден"
            )
        
        # ⬇️⬇️⬇️ ИСПРАВЛЯЕМ: используем get_by_producer_id вместо get ⬇️⬇️⬇️
        producer = await crud_user.get_by_producer_id(db, UUID(producer_id))
        if not producer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь не является продюсером или не найден"
            )
        
        # Назначаем продюсера
        order.producer_id = producer.id
        
        # Автоматически меняем статус если заказ был готов для проверки
        if order.status == OrderStatus.READY_FOR_REVIEW:
            order.status = OrderStatus.IN_PROGRESS
            print(f"🔍 Auto-changing status to IN_PROGRESS for order {order_id}")

        # Автоматически меняем статус если заказ был был в черновиках
        if order.status == OrderStatus.DRAFT:
            if order.tariff_plan == "premium":
                order.status = OrderStatus.WAITING_INTERVIEW
                print(f"🔍 Auto-changing status to WAITING_INTERVIEW for order {order_id}")
            else:
                order.status = OrderStatus.IN_PROGRESS
                print(f"🔍 Auto-changing status to IN_PROGRESS for order {order_id}")

        await db.commit()
        await db.refresh(order)
        
        # TODO: Отправить уведомление продюсеру
        
        print(f"✅ Producer {producer_id} assigned to order {order_id}")
        
        return {
            "message": f"Продюсер {producer.name} назначен на заказ",
            "order_id": str(order.id),
            "producer_id": str(producer.id),
            "status": order.status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print(f"❌ Error assigning producer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при назначении продюсера: {str(e)}"
        )

@router.post("/orders/{order_id}/confirm-payment-received")
async def confirm_payment_received(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_admin)
):
    """
    Админ подтверждает что оплата получена (для ручной оплаты)
    """
    try:
        order = await crud_order.get(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        if order.status != OrderStatus.PAYMENT_PENDING:
            raise HTTPException(
                status_code=400,
                detail="Заказ не ожидает подтверждения оплаты"
            )
        
        # Меняем статус на оплачен
        order.status = OrderStatus.PAID
        order.paid_at = datetime.utcnow()
        
        await db.commit()
        
        # TODO: Уведомление продюсеру что можно загружать финальный трек
        # TODO: Уведомление пользователю что оплата подтверждена
        
        logger.info(f"Админ подтвердил оплату для заказа {order_id}")
        
        return {
            "message": "Оплата подтверждена! Заказ переведен в статус 'Оплачен'",
            "status": order.status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Ошибка подтверждения оплаты админом: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка подтверждения оплаты: {str(e)}"
        )