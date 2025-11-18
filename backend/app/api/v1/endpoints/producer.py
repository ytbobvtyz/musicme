# app/api/v1/endpoints/producer.py
"""
Endpoints для работы продюсера с заказами
"""
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
import traceback
import logging
import uuid
import os

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_producer
from app.models.user import User
from app.models.order import Order
from app.schemas.order import Order as OrderSchema
from app.schemas.order import OrderDetail
from app.schemas.user import User as UserSchema
from app.crud.order import crud_order
from app.schemas.track import Track as TrackSchema
from app.models.track import Track
from app.core.file_storage import file_storage

router = APIRouter()

@router.get("/orders", response_model=List[OrderSchema])
async def get_producer_orders(
    order_status: Optional[str] = None,  # ← ПЕРЕИМЕНОВАЛИ ПАРАМЕТР
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получить заказы текущего продюсера
    """
    try:
        print(f"🔍 Producer orders request from: {current_user.id} ({current_user.email})")
        print(f"🔍 is_producer: {current_user.is_producer}, is_admin: {current_user.is_admin}")
        print(f"🔍 Status filter: {order_status}")  # ← используем переименованный параметр
        
        # Проверяем что пользователь продюсер или админ
        if not current_user.is_producer and not current_user.is_admin:
            print("❌ User is not producer or admin")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Только продюсеры могут просматривать свои заказы"
            )
        
        # Получаем заказы продюсера
        orders = await crud_order.get_by_producer(
            db, 
            producer_id=current_user.id,
            status=order_status  # ← используем переименованный параметр
        )
        
        print(f"🔍 Found {len(orders)} orders for producer")
        
        # Преобразуем в схему без связанных объектов чтобы избежать ошибок
        result = []
        for order in orders:
            order_dict = {
                "id": order.id,
                "user_id": order.user_id,
                "theme_id": order.theme_id,
                "genre_id": order.genre_id,
                "producer_id": order.producer_id,
                "recipient_name": order.recipient_name,
                "occasion": order.occasion,
                "details": order.details,
                "tariff_plan": order.tariff_plan,
                "preferences": order.preferences,
                "status": order.status,
                "deadline_at": order.deadline_at,
                "price": order.price,
                "rounds_remaining": order.rounds_remaining,
                "interview_link": order.interview_link,
                "created_at": order.created_at,
                "updated_at": order.updated_at,
            }
            result.append(order_dict)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting producer orders: {str(e)}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении заказов: {str(e)}"
        )

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: UUID,
    status_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Обновить статус заказа (для продюсера)
    """
    try:
        new_status = status_data.get("status")
        if not new_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="status обязателен"
            )
        
        # Получаем заказ
        order = await crud_order.get(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Заказ не найден"
            )
        
        # Проверяем что заказ принадлежит текущему продюсеру
        if order.producer_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Вы не являетесь продюсером этого заказа"
            )
        
        # Обновляем статус
        order.status = new_status
        await db.commit()
        await db.refresh(order)
        
        return {"message": "Статус заказа обновлен", "status": order.status}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении статуса: {str(e)}"
        )

@router.get("/orders/{order_id}", response_model=OrderDetail)
async def get_producer_order_detail(
    order_id: UUID,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_producer)
):
    """
    Получить детальную информацию о заказе (для продюсера)
    """
    order = await crud_order.get_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    if order.producer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
    
    return order


@router.post("/tracks", response_model=TrackSchema)
async def upload_track(
    order_id: UUID = Form(...),
    title: str = Form(...),
    audio_file: UploadFile = File(...),
    is_preview: bool = Form(True),  # ← по умолчанию превью
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Загрузить трек для заказа (для продюсера)
    """
    try:
        print(f"🔍 Producer uploading track for order {order_id}")
        print(f"🔍 File: {audio_file.filename}, title: {title}, is_preview: {is_preview}")
        
        # Проверяем что пользователь продюсер или админ
        if not current_user.is_producer and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Только продюсеры могут загружать треки"
            )
        
        # Проверяем заказ
        order = await crud_order.get(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Заказ не найден"
            )
        
        # Проверяем что заказ принадлежит текущему продюсеру
        if order.producer_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Вы не являетесь продюсером этого заказа"
            )
        
        # Автоматически определяем is_preview для оплаченных заказов
        if order.status == 'paid':
            is_preview = False
            print("🔍 Order is paid, forcing full version")
        
        # Проверяем файл
        if not audio_file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Файл не имеет имени"
            )
        
        # Проверяем что файл аудио
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Файл должен быть аудио"
            )
        
        # Сохраняем файл (обрезаем если это превью)
        if is_preview:
            print("🔍 Creating preview version (60 seconds)")
            file_info = await _create_preview_version(audio_file)
        else:
            print("🔍 Creating full version")
            file_info = await _save_full_audio_file(audio_file)
        
        print(f"🔍 File saved: {file_info['filename']}, size: {file_info['size']}")
        
        # Создаем запись в БД
        db_track = Track(
            order_id=order_id,
            title=title,
            audio_filename=file_info["filename"],
            audio_size=file_info["size"],
            audio_mimetype=file_info["mimetype"],
            is_preview=is_preview  # ← используем is_preview как в админке
        )
        
        db.add(db_track)
        await db.commit()
        await db.refresh(db_track)
        
        print(f"✅ Track created: {db_track.id}, is_preview: {db_track.is_preview}")
        
        return TrackSchema.model_validate(db_track)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error uploading track: {str(e)}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при загрузке трека: {str(e)}"
        )

async def _create_preview_version (audio_file: UploadFile) -> dict:
    """
    Создать превью версию используя pydub
    """
    try:
        print("🔍 Starting preview creation with pydub...")
        
        # Читаем содержимое файла в память
        file_content = await audio_file.read()
        print(f"🔍 Original file size: {len(file_content)} bytes")
        
        # Создаем временный файл
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name
        
        try:
            from pydub import AudioSegment
            
            # Загружаем аудио файл
            audio = AudioSegment.from_file(temp_path)
            print(f"🔍 Original audio duration: {len(audio) / 1000} seconds")
            
            # Обрезаем до 60 секунд (60000 миллисекунд)
            preview_audio = audio[:60000]  # первые 60 секунд
            
            # Сохраняем превью
            output_filename = f"{uuid.uuid4()}_preview.mp3"
            output_path = os.path.join(file_storage.audio_dir, output_filename)
            
            preview_audio.export(output_path, format="mp3")
            
            # Получаем информацию о файле
            file_size = os.path.getsize(output_path)
            print(f"✅ Preview created with pydub: {output_filename}, size: {file_size} bytes")
            
            return {
                "filename": output_filename,
                "size": file_size,
                "mimetype": "audio/mpeg",
                "original_name": audio_file.filename
            }
            
        except ImportError:
            print("❌ Pydub not available, using original file")
            os.unlink(temp_path)
            audio_file.file.seek(0)
            return await file_storage.save_audio_file(audio_file, "audio")
            
        except Exception as e:
            print(f"❌ Pydub error: {str(e)}")
            os.unlink(temp_path)
            audio_file.file.seek(0)
            return await file_storage.save_audio_file(audio_file, "audio")
            
    except Exception as e:
        print(f"❌ Error creating preview with pydub: {str(e)}")
        # Удаляем временный файл если он существует
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.unlink(temp_path)
        audio_file.file.seek(0)
        return await file_storage.save_audio_file(audio_file, "audio")

async def _save_full_audio_file(audio_file: UploadFile) -> dict:
    """
    Сохранить полную версию аудио файла используя file_storage
    """
    try:
        # Используем file_storage для сохранения файла
        file_info = await file_storage.save_audio_file(audio_file, "audio")
        
        print(f"🔍 Full audio file saved: {file_info['filename']}")
        
        return {
            "filename": file_info["filename"],
            "size": file_info["size"],
            "mimetype": file_info["mimetype"],
            "original_name": file_info["original_name"]
        }
        
    except HTTPException:
        # Пробрасываем HTTPException от file_storage
        raise
    except Exception as e:
        print(f"❌ Error saving full audio file: {str(e)}")
        raise Exception(f"Ошибка при сохранении аудио файла: {str(e)}")