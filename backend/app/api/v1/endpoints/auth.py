"""
Endpoints для аутентификации
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import OAuthRequest, AuthResponse

router = APIRouter()


@router.post("/login/{provider}", response_model=AuthResponse)
async def oauth_login(
    provider: str,
    oauth_data: OAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    OAuth авторизация через провайдера (VK, Yandex, Google)
    """
    if provider not in ["vk", "yandex", "google"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неподдерживаемый провайдер"
        )
    
    # TODO: Реализовать OAuth логику
    # 1. Обменять code на access_token у провайдера
    # 2. Получить информацию о пользователе
    # 3. Создать или найти пользователя в БД
    # 4. Сгенерировать JWT токен
    
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="OAuth авторизация еще не реализована"
    )


@router.get("/me")
async def get_current_user(
    # TODO: Добавить зависимость для получения текущего пользователя через JWT
):
    """
    Получить информацию о текущем пользователе
    """
    # TODO: Реализовать получение текущего пользователя
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Получение текущего пользователя еще не реализовано"
    )

