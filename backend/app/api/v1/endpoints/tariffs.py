from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import traceback

from app.core.database import get_db
from app.schemas.tariff import Tariff, TariffListResponse
from app.crud.tariff import crud_tariff

router = APIRouter()

@router.get("", response_model=TariffListResponse)
async def get_tariffs(db: AsyncSession = Depends(get_db)):
    """
    Получить список активных тарифных планов
    """
    try:
        print("🔍 tariffs endpoint called")  # ← ДЛЯ ОТЛАДКИ
        
        tariffs = await crud_tariff.get_active(db)
        print(f"🔍 Found {len(tariffs)} tariffs")  # ← ДЛЯ ОТЛАДКИ
        
        # Проверим структуру данных
        for tariff in tariffs:
            print(f"🔍 Tariff: {tariff.code}, features: {tariff.features}")
        
        return TariffListResponse(tariffs=tariffs)
    except Exception as e:
        print(f"❌ Error in tariffs endpoint: {e}")  # ← ДЛЯ ОТЛАДКИ
        print(f"❌ Traceback: {traceback.format_exc()}")  # ← ДЛЯ ОТЛАДКИ
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении тарифов: {str(e)}"
        )

@router.get("/{tariff_id}", response_model=Tariff)
async def get_tariff(tariff_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Получить тариф по ID
    """
    tariff = await crud_tariff.get(db, tariff_id)
    if not tariff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тариф не найден"
        )
    return tariff

@router.get("/code/{tariff_code}", response_model=Tariff)
async def get_tariff_by_code(tariff_code: str, db: AsyncSession = Depends(get_db)):
    """
    Получить тариф по коду
    """
    tariff = await crud_tariff.get_by_code(db, tariff_code)
    if not tariff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тариф не найден"
        )
    return tariff