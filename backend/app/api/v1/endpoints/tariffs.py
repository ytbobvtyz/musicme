"""
Эндпоинты для работы с тарифными планами
"""
from fastapi import APIRouter, Depends
from app.schemas.tariff import TariffListResponse, TariffPlanSchema
from app.core.tariffs import TARIFF_CONFIG
from app.models.order import TariffPlan

router = APIRouter()

@router.get("", response_model=TariffListResponse)
async def get_tariffs():
    """
    Получить список всех тарифных планов
    """
    tariffs = []
    
    for tariff_id, config in TARIFF_CONFIG.items():
        tariff_schema = TariffPlanSchema(
            id=tariff_id,
            name=config["name"],
            description=config["description"],
            price=config["price"],
            original_price=config.get("original_price"),
            deadline_days=config["deadline_days"],
            rounds=config["rounds"],
            has_questionnaire=config["has_questionnaire"],
            has_interview=config["has_interview"],
            features=config["features"],
            badge=config.get("badge"),
            popular=config.get("popular", False)
        )
        tariffs.append(tariff_schema)
    
    return TariffListResponse(tariffs=tariffs)

@router.get("/{tariff_id}")
async def get_tariff(tariff_id: TariffPlan):
    """
    Получить информацию о конкретном тарифе
    """
    config = TARIFF_CONFIG.get(tariff_id)
    if not config:
        return {"error": "Тариф не найден"}
    
    return TariffPlanSchema(
        id=tariff_id,
        **config
    )