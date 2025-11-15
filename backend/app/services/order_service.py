"""
Сервисный слой для бизнес-логики заказов
"""
from typing import Optional, Dict, Any
from uuid import UUID
from fastapi import HTTPException, status

from app.schemas.order import OrderCreate
from app.core.tariffs import get_tariff_config, TARIFF_CONFIG
from app.models.order import TariffPlan


class OrderService:
    @staticmethod
    def validate_order_data(order_data: OrderCreate) -> None:
        """Валидация данных заказа перед созданием"""
        # ⬇️ ИСПРАВЛЯЕМ: Используем тот же алгоритм что в CRUD
        tariff_plan = None
        
        # 1. Сначала проверяем preferences.tariff
        if order_data.preferences and order_data.preferences.get('tariff'):
            tariff_plan = order_data.preferences['tariff']
        
        # 2. Если нет в preferences, проверяем корень
        if not tariff_plan and order_data.tariff_plan:
            tariff_plan = order_data.tariff_plan
        
        # 3. Если все еще нет - используем basic
        tariff_plan = tariff_plan or 'basic'
        
        print(f"🔍 OrderService tariff decision: {tariff_plan}")
        
        from app.core.tariffs import TARIFF_CONFIG
        from app.models.tariff_plan import TariffPlan
        
        # Проверяем что тариф существует
        if tariff_plan not in [tp.value for tp in TariffPlan]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неизвестный тариф: {tariff_plan}"
            )
        
        tariff_config = get_tariff_config(TariffPlan(tariff_plan))
        
        # Проверяем анкету для продвинутых тарифов
        if tariff_config['has_questionnaire']:
            if not order_data.preferences or not order_data.preferences.get('questionnaire'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Для тарифа '{tariff_plan}' требуется заполнить анкету"
                )
        
        # Проверяем контакты для премиум тарифа
        if tariff_config['has_interview']:
            if not order_data.preferences or not order_data.preferences.get('contact'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Для тарифа '{tariff_plan}' требуется указать контактные данные"
                )

    @staticmethod
    def prepare_order_data(
        order_data: OrderCreate, 
        user_id: UUID
    ) -> Dict[str, Any]:
        """Подготовка данных заказа с автоматической настройкой тарифа"""
        # ⬇️ Тот же алгоритм определения тарифа
        tariff_plan = None
        
        if order_data.preferences and order_data.preferences.get('tariff'):
            tariff_plan = order_data.preferences['tariff']
        
        if not tariff_plan and order_data.tariff_plan:
            tariff_plan = order_data.tariff_plan
        
        tariff_plan = tariff_plan or 'basic'
        
        tariff_config = get_tariff_config(TariffPlan(tariff_plan))
        
        order_dict = order_data.dict()
        
        # ⬇️ ОБНОВЛЯЕМ tariff_plan в корне
        order_dict['tariff_plan'] = tariff_plan
        
        # Автоматически устанавливаем поля из конфига тарифа
        order_dict.update({
            'price': tariff_config['price'],
            'rounds_remaining': tariff_config['rounds'],
        })
        
        # Устанавливаем пользователя
        order_dict['user_id'] = user_id
        
        return order_dict

    
    @staticmethod
    def can_request_revision(order) -> bool:
        """Может ли пользователь запросить правку"""
        return (
            order.status in ['ready_for_review', 'ready'] and 
            order.rounds_remaining > 0
        )
    
    @staticmethod
    def get_tariff_requirements(tariff: TariffPlan) -> Dict[str, Any]:
        """Получить требования для тарифа"""
        config = get_tariff_config(tariff)
        return {
            'requires_questionnaire': config['has_questionnaire'],
            'requires_interview': config['has_interview'],
            'max_revisions': config['rounds'],
            'deadline_days': config['deadline_days']
        }


# Создаем экземпляр сервиса
order_service = OrderService()