"""
Конфигурация тарифных планов
"""
from typing import Dict, Any
from app.models.order import TariffPlan
from app.models.tariff_plan import TariffPlan

# Конфигурация тарифных планов
TARIFF_CONFIG: Dict[TariffPlan, Dict[str, Any]] = {
    TariffPlan.BASIC: {
        "name": "Базовый",
        "price": 2900,
        "original_price": 3900,  # для отображения зачеркнутой цены
        "deadline_days": 1,
        "rounds": 1,
        "has_questionnaire": False,
        "has_interview": False,
        "description": "Идеально для быстрых поздравлений",
        "features": [
            "Песня до 3 минут",
            "1 раунд правок", 
            "Готовность за 24 часа",
            "Базовый текст и аранжировка"
        ],
        "badge": None,  # или "Эконом"
        "popular": False
    },
    TariffPlan.ADVANCED: {
        "name": "Продвинутый",
        "price": 4900,
        "original_price": 5900,
        "deadline_days": 2,
        "rounds": 2,
        "has_questionnaire": True,
        "has_interview": False,
        "description": "Для особых моментов с глубокой персонализацией",
        "features": [
            "Песня до 4 минут",
            "2 раунда правок",
            "Готовность за 48 часов", 
            "Детальная анкета",
            "Углубленная персонализация",
            "Приоритет в очереди"
        ],
        "badge": "Популярный",
        "popular": True
    },
    TariffPlan.PREMIUM: {
        "name": "Премиум", 
        "price": 9900,
        "original_price": 12900,
        "deadline_days": 3,
        "rounds": 999,  # неограниченно (в рамках адекватного)
        "has_questionnaire": True,
        "has_interview": True,
        "description": "Эксклюзивная работа с персональным продюсером",
        "features": [
            "Песня до 5 минут",
            "Неограниченные правки",
            "Готовность за 72 часа",
            "Видео-интервью с продюсером",
            "Эксклюзивная аранжировка", 
            "Высший приоритет",
            "Персональный менеджер"
        ],
        "badge": "Премиум",
        "popular": False
    }
}

# Вспомогательные функции для работы с тарифами
def get_tariff_config(tariff: TariffPlan) -> Dict[str, Any]:
    """Получить конфигурацию тарифа"""
    return TARIFF_CONFIG.get(tariff, TARIFF_CONFIG[TariffPlan.BASIC])

def get_tariff_price(tariff: TariffPlan) -> int:
    """Получить цену тарифа"""
    return get_tariff_config(tariff)["price"]

def get_tariff_deadline_days(tariff: TariffPlan) -> int:
    """Получить срок выполнения в днях"""
    return get_tariff_config(tariff)["deadline_days"]

def get_tariff_rounds(tariff: TariffPlan) -> int:
    """Получить количество доступных правок"""
    return get_tariff_config(tariff)["rounds"]

def validate_tariff_features(tariff: TariffPlan) -> bool:
    """Проверить корректность конфигурации тарифа"""
    config = get_tariff_config(tariff)
    required_fields = ["price", "deadline_days", "rounds", "has_questionnaire", "has_interview"]
    return all(field in config for field in required_fields)

# Валидация всех тарифов при импорте
for tariff in TariffPlan:
    if not validate_tariff_features(tariff):
        raise ValueError(f"Invalid configuration for tariff: {tariff}")