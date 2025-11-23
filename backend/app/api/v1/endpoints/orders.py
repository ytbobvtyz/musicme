"""
Endpoints для работы с заказами
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
import logging
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.order import crud_order
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.order import Order, OrderCreate, OrderDetail, OrderUpdate
from app.schemas.user import User as UserSchema
from app.models.order import OrderStatus
from app.models.tariff_plan import TariffPlan
from app.services.order_service import order_service
from app.services.order_status_service import order_status_service
from app.crud.revision import crud_revision_comment
from app.schemas.revision import RevisionCommentCreate

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Создать новый заказ
    """
    try:
        logger.info(f"Создание заказа для пользователя {current_user.id}")
        print(f"🔍 DEBUG OrderCreate data: {order_data.dict()}")
        print(f"🔍 DEBUG Tariff from request: {order_data.tariff_plan}")
        
        # Валидация бизнес-логики - ПЕРЕДАЕМ db
        await order_service.validate_order_data(order_data, db)
        
        # Подготовка данных - ПЕРЕДАЕМ db
        order_dict = await order_service.prepare_order_data(
            order_data, 
            user_id=current_user.id,
            db=db  # ← ДОБАВЛЯЕМ db
        )
        
        print(f"🔍 DEBUG: Prepared order dict: {order_dict}")
        
        # Создаем заказ через CRUD
        order = await crud_order.create(db, order_dict, user_id=current_user.id)
        
        await db.refresh(order, ['theme', 'genre'])
        
        logger.info(f"Заказ создан: {order.id}")
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при создании заказа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании заказа: {str(e)}"
        )
        
@router.get("", response_model=List[Order])
async def get_orders(
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Получить список заказов пользователя
    """
    orders = await crud_order.get_by_user(db, current_user.id)
    return orders

@router.get("/{order_id}", response_model=OrderDetail)
async def get_order(
    order_id: UUID,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Получить детальную информацию о заказе с треками
    """
    try:
        logger.info(f"🔍 GET ORDER - Order ID: {order_id}, User: {current_user.id if current_user else 'guest'}")
        
        order = await crud_order.get_by_id(db, order_id)
        logger.info(f"📦 Order found: {order is not None}")
        
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        # Проверка прав доступа
        if current_user:
            # Авторизованный пользователь - проверяем принадлежность
            if order.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
        else:
            raise HTTPException(status_code=403, detail="Требуется авторизация")
            # В реальном сценарии здесь должна быть проверка токена или сессии
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

@router.patch("/{order_id}", response_model=Order)
async def update_order(
    order_id: UUID,
    order_update: OrderUpdate,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Обновить заказ (только статус и правки)
    """
    try:
        # Проверяем что заказ принадлежит пользователю
        order = await crud_order.get_by_id(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
        
        # Обновляем заказ
        updated_order = await crud_order.update(db, order_id, order_update)
        
        return updated_order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при обновлении заказа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении заказа: {str(e)}"
        )

@router.post("/{order_id}/approve", response_model=Order)
async def approve_order(
    order_id: UUID,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Подтвердить заказ после прослушивания preview (перевод в статус PAID)
    """
    try:
        # Проверяем что заказ принадлежит пользователю
        order = await crud_order.get_by_id(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
        
        # Проверяем что заказ в правильном статусе
        if order.status != OrderStatus.READY_FOR_REVIEW:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заказ не готов для подтверждения"
            )
        
        # Обновляем статус на PAID
        updated_order = await crud_order.update_status(db, order_id, OrderStatus.PAID)
        
        logger.info(f"Заказ подтвержден: {order_id}")
        return updated_order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при подтверждении заказа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при подтверждении заказа: {str(e)}"
        )

# app/api/v1/endpoints/orders.py - обновляем request_revision
@router.post("/{order_id}/request-revision", response_model=Order)
async def request_revision(
    order_id: UUID,
    revision_data: dict = None,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Запросить правку для заказа с комментарием
    """
    try:
        # Извлекаем комментарий
        comment = ""
        if revision_data and 'comment' in revision_data:
            comment = revision_data.get('comment', '').strip()
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Комментарий обязателен для запроса правки"
            )
        
        # Проверяем что заказ принадлежит пользователю
        order = await crud_order.get_by_id(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
        
        # Проверяем что заказ в правильном статусе
        if order.status != OrderStatus.READY_FOR_REVIEW:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Запрос правки возможен только когда заказ готов для проверки"
            )
        
        # Проверяем что есть доступные правки
        if order.rounds_remaining <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Лимит правок исчерпан"
            )
        
        # Получаем номер следующей правки
        revision_number = await crud_revision_comment.get_last_revision_number(db, order_id) + 1
        
        # Сохраняем комментарий
        from app.schemas.revision import RevisionCommentCreate
        comment_data = RevisionCommentCreate(
            order_id=order_id,
            comment=comment
        )
        await crud_revision_comment.create(db, comment_data, current_user.id, revision_number)
        
        # Используем сервис для обработки правки
        has_revisions_left = await order_status_service.on_revision_requested(db, order)
        
        if not has_revisions_left:
            raise HTTPException(
                status_code=400, 
                detail="Лимит правок исчерпан"
            )
        
        logger.info(f"Запрошена правка для заказа: {order_id}, комментарий: {comment}, правка #{revision_number}, осталось правок: {order.rounds_remaining}")
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при запросе правки: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при запросе правки: {str(e)}"
        )
    

@router.get("/{order_id}/revision-comments")
async def get_revision_comments(
    order_id: UUID,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Получить комментарии правок для заказа
    """
    try:
        # Проверяем что заказ существует
        order = await crud_order.get_by_id(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        # Проверяем права доступа
        has_access = (
            order.user_id == current_user.id or 
            order.producer_id == current_user.id or 
            current_user.is_admin
        )
        
        if not has_access:
            raise HTTPException(status_code=403, detail="Нет доступа к комментариям")
        
        # Получаем комментарии
        comments = await crud_revision_comment.get_by_order(db, order_id)
        
        # Форматируем ответ
        from app.schemas.revision import RevisionCommentWithUser
        formatted_comments = []
        for comment in comments:
            comment_dict = {
                "id": comment.id,
                "order_id": comment.order_id,
                "user_id": comment.user_id,
                "comment": comment.comment,
                "revision_number": comment.revision_number,
                "created_at": comment.created_at,
                "user_name": comment.user.name if comment.user else "Пользователь",
                "user_email": comment.user.email if comment.user else ""
            }
            formatted_comments.append(comment_dict)
        
        return formatted_comments
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении комментариев: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении комментариев: {str(e)}"
        )
    
@router.post("/{order_id}/confirm-payment")
async def confirm_payment(
    order_id: UUID,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Пользователь подтверждает что оплатил
    """
    try:
        order = await crud_order.get_by_id(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Нет доступа")
        
        if order.status != OrderStatus.READY_FOR_REVIEW:
            raise HTTPException(
                status_code=400,
                detail="Нельзя подтвердить оплату для этого статуса"
            )
        
        # Меняем статус на ожидание проверки оплаты
        order.status = OrderStatus.PAYMENT_PENDING
        order.payment_confirmed_at = datetime.now(timezone.utc).replace(tzinfo=None)
        
        await db.commit()
        
        # TODO: Уведомление продюсеру
        # TODO: Уведомление админу о необходимости проверки оплаты
        
        return {
            "message": "Отлично! Мы проверим оплату и в течение 24 часов (обычно быстрее!) выложим полный трек на вашу страницу!",
            "status": order.status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Ошибка подтверждения оплаты")


@router.post("/{order_id}/final-approve")
async def final_approve(
    order_id: UUID,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Пользователь подтверждает что всё отлично
    """
    order = await crud_order.get_by_id(db, order_id)
    # Проверки прав...
    
    order.status = OrderStatus.COMPLETED
    order.completed_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": "Спасибо за заказ! Трек полностью ваш!"}

@router.post("/{order_id}/final-revision")
async def request_final_revision(
    order_id: UUID,
    revision_data: dict,
    db = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Запрос финальной правки после оплаты (без возврата в IN_PROGRESS)
    """
    try:
        order = await crud_order.get_by_id(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
        
        # Проверяем что заказ в правильном статусе для финальной правки
        if order.status != OrderStatus.READY_FOR_FINAL_REVIEW:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Финальная правка возможна только после загрузки финального трека"
            )
        
        comment = revision_data.get("comment", "").strip()
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Комментарий обязателен для финальной правки"
            )
        
        # Получаем номер следующей правки
        revision_number = await crud_revision_comment.get_last_revision_number(db, order_id) + 1
        
        # Сохраняем комментарий финальной правки
        comment_data = RevisionCommentCreate(
            order_id=order_id,
            comment=f"ФИНАЛЬНАЯ ПРАВКА: {comment}"
        )
        await crud_revision_comment.create(db, comment_data, current_user.id, revision_number)
        
        # ⬇️⬇️⬇️ ВАЖНОЕ ИЗМЕНЕНИЕ: Не возвращаем в IN_PROGRESS, а переводим в специальный статус
        order.status = OrderStatus.IN_PROGRESS_FINAL_REVISION  # Нужно добавить этот статус в OrderStatus
        
        await db.commit()
        
        # TODO: Уведомление продюсеру о финальной правке
        
        logger.info(f"Запрошена финальная правка для заказа: {order_id}, правка #{revision_number}")
        
        return {
            "message": "Финальная правка отправлена продюсеру!",
            "status": order.status,
            "revision_number": revision_number
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при запросе финальной правки: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при запросе финальной правки: {str(e)}"
        )

@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Отменить заказ (только для пользователя)
    """
    try:
        # Получаем заказ
        order = await crud_order.get_by_id(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        
        # Проверяем права доступа
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
        
        # Проверяем можно ли отменить заказ
        if order.status in [OrderStatus.PAID, OrderStatus.COMPLETED, OrderStatus.CANCELLED]:
            raise HTTPException(
                status_code=400,
                detail="Невозможно отменить заказ в текущем статусе"
            )
        
        # Меняем статус на отмененный
        order.status = OrderStatus.CANCELLED
        order.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        
        await db.commit()
        
        # TODO: Уведомление продюсеру если заказ был назначен
        if order.producer_id:
            logger.info(f"Заказ {order_id} отменен, уведомляем продюсера {order.producer_id}")
        
        logger.info(f"Пользователь {current_user.id} отменил заказ {order_id}")
        
        return {
            "message": "Заказ успешно отменен",
            "order_id": str(order.id),
            "status": order.status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Ошибка при отмене заказа: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при отмене заказа: {str(e)}"
        )