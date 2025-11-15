"""
Enum тарифных планов (вынесен в отдельный файл чтобы избежать циклических импортов)
"""
from enum import Enum

class TariffPlan(str, Enum):
    """Тарифные планы"""
    BASIC = "basic"
    ADVANCED = "advanced" 
    PREMIUM = "premium"
    