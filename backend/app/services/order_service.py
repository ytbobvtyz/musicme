"""
Сервис для работы с заказами
"""
from typing import Dict, Any
from uuid import UUID
from fastapi import HTTPException, status
import logging

from app.schemas.order import OrderCreate
from app.crud.tariff import crud_tariff
from app.services.notification_service import notification_service

logger = logging.getLogger(__name__)


class OrderService:
    @staticmethod
    async def validate_order_data(order_data: OrderCreate, db) -> None:
        """Валидация данных заказа перед созданием"""
        # ⬇️ ЗАМЕНЯЕМ на работу с БД
        tariff_plan = None
        
        if order_data.preferences and order_data.preferences.get('tariff'):
            tariff_plan = order_data.preferences['tariff']
        
        if not tariff_plan and order_data.tariff_plan:
            tariff_plan = order_data.tariff_plan
        
        tariff_plan = tariff_plan or 'basic'
        
        # Получаем тариф из БД
        tariff = await crud_tariff.get_by_code(db, tariff_plan)
        if not tariff:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неизвестный тариф: {tariff_plan}"
            )
        
        # Проверяем анкету для продвинутых тарифов
        if tariff.has_questionnaire:
            if not order_data.preferences or not order_data.preferences.get('questionnaire'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Для тарифа '{tariff_plan}' требуется заполнить анкету"
                )
        
        # Проверяем контакты для премиум тарифа
        if tariff.has_interview:
            if not order_data.preferences or not order_data.preferences.get('contact'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Для тарифа '{tariff_plan}' требуется указать контактные данные"
                )

    @staticmethod
    async def prepare_order_data(
        order_data: OrderCreate, 
        user_id: UUID,
        db  # ← ДОБАВЛЯЕМ db для работы с тарифами
    ) -> Dict[str, Any]:
        """Подготовка данных заказа с автоматической настройкой тарифа"""
        # ⬇️ ЗАМЕНЯЕМ на работу с БД
        tariff_plan = None
        
        if order_data.preferences and order_data.preferences.get('tariff'):
            tariff_plan = order_data.preferences['tariff']
        
        if not tariff_plan and order_data.tariff_plan:
            tariff_plan = order_data.tariff_plan
        
        tariff_plan = tariff_plan or 'basic'
        
        # Получаем тариф из БД
        tariff = await crud_tariff.get_by_code(db, tariff_plan)
        if not tariff:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Тариф '{tariff_plan}' не найден"
            )
        
        order_dict = order_data.dict()
        
        # ⬇️ ОБНОВЛЯЕМ tariff_plan в корне
        order_dict['tariff_plan'] = tariff_plan
        
        # Автоматически устанавливаем поля из тарифа
        order_dict.update({
            'price': tariff.price,
            'rounds_remaining': tariff.rounds,
        })
        
        # Устанавливаем пользователя
        order_dict['user_id'] = user_id
        
        return order_dict

    @staticmethod
    async def after_order_created(order_id: UUID, db) -> bool:
        """
        Действия после создания заказа
        
        Args:
            order_id: UUID созданного заказа
            db: Сессия базы данных
            
        Returns:
            bool: True если действия выполнены успешно
        """
        try:
            # 1. Отправляем уведомления
            await notification_service.notify_order_created(order_id)
            
            # 2. Можно добавить другие действия:
            # - Логирование
            # - Аналитика
            # - Интеграция с внешними сервисами
            
            logger.info(f"Post-creation actions completed for order {order_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error in after_order_created for order {order_id}: {e}")
            return False


order_service = OrderService()