from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import traceback

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.schemas.tariff import Tariff, Tariff, TariffListResponse, TariffCreate, TariffUpdate
from app.crud.tariff import crud_tariff
from app.models.user import User

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

@router.post("", response_model=Tariff)
async def create_tariff(
    tariff_data: TariffCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)  # ← ТОЛЬКО ДЛЯ АДМИНОВ
):
    """
    Создать новый тариф (только для администраторов)
    """
    try:
        print(f"🔍 Creating tariff: {tariff_data.code}")
        
        # Проверяем, нет ли уже тарифа с таким кодом
        existing_tariff = await crud_tariff.get_by_code(db, tariff_data.code)
        if existing_tariff:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Тариф с кодом '{tariff_data.code}' уже существует"
            )
        
        tariff = await crud_tariff.create(db, tariff_data)
        print(f"✅ Tariff created: {tariff.id}")
        
        return tariff
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating tariff: {e}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании тарифа: {str(e)}"
        )

@router.put("/{tariff_id}", response_model=Tariff)
async def update_tariff(
    tariff_id: UUID,
    tariff_data: TariffUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Обновить тариф (только для администраторов)
    """
    try:
        print(f"🔍 Updating tariff: {tariff_id}")
        print(f"🔍 Current user: {current_user.id} ({current_user.email})")
        print(f"🔍 User is admin: {current_user.is_admin}")
        print(f"🔍 Update data: {tariff_data.dict()}")
        
        # Получаем тариф для обновления
        tariff = await crud_tariff.get(db, tariff_id)
        if not tariff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Тариф не найден"
            )

        updated_tariff = await crud_tariff.update(db, tariff, tariff_data)
        print(f"✅ Tariff updated: {updated_tariff.id}")
        
        return updated_tariff
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating tariff: {e}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении тарифа: {str(e)}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating tariff: {e}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении тарифа: {str(e)}"
        )

@router.delete("/{tariff_id}")
async def delete_tariff(
    tariff_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)  # ← ТОЛЬКО ДЛЯ АДМИНОВ
):
    """
    Удалить тариф (только для администраторов)
    """
    try:
        print(f"🔍 Deleting tariff: {tariff_id}")
        
        # Проверяем что тариф существует
        tariff = await crud_tariff.get(db, tariff_id)
        if not tariff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Тариф не найден"
            )
        
        # Удаляем тариф
        success = await crud_tariff.delete(db, tariff_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Не удалось удалить тариф"
            )
        
        print(f"✅ Tariff deleted: {tariff_id}")
        
        return {"message": "Тариф успешно удален"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting tariff: {e}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при удалении тарифа: {str(e)}"
        )
        