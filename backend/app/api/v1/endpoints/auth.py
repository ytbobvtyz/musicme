"""
Endpoints для аутентификации
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from datetime import timedelta

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user as get_current_user_dep
from app.core.security import create_access_token
from app.schemas.auth import OAuthRequest, AuthResponse
from app.schemas.user import User as UserSchema
from app.crud.user import upsert_user_by_email

router = APIRouter()


async def _yandex_exchange_code_for_token(code: str, redirect_uri: str) -> dict:
    """
    Обмен кода на access_token в Яндекс OAuth
    """
    token_url = "https://oauth.yandex.ru/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": settings.YANDEX_CLIENT_ID,
        "client_secret": settings.YANDEX_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(token_url, data=data, headers=headers)
        if r.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ошибка обмена кода на токен (Yandex)")
        return r.json()


async def _yandex_fetch_user_info(access_token: str) -> dict:
    """
    Получение информации о пользователе Яндекс
    """
    # Согласно документации Яндекс.Паспорт
    # https://yandex.ru/dev/id/doc/ru/codes/process-auth#passport
    info_url = "https://login.yandex.ru/info?format=json"
    headers = {"Authorization": f"OAuth {access_token}"}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(info_url, headers=headers)
        if r.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ошибка получения профиля (Yandex)")
        return r.json()


@router.post("/login/{provider}", response_model=AuthResponse)
async def oauth_login(
    provider: str,
    oauth_data: OAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    OAuth авторизация через провайдера (VK, Yandex, Google)
    """
    if provider not in ["vk", "yandex", "google"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Неподдерживаемый провайдер")

    if provider == "yandex":
        token_data = await _yandex_exchange_code_for_token(oauth_data.code, oauth_data.redirect_uri)
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Не удалось получить access_token (Yandex)")

        profile = await _yandex_fetch_user_info(access_token)
        # Извлекаем данные
        email = profile.get("default_email") or profile.get("emails", [None])[0]
        if not email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Профиль Yandex не содержит email")

        name = profile.get("display_name") or profile.get("real_name") or None
        avatar_id = profile.get("default_avatar_id")
        avatar_url = f"https://avatars.yandex.net/get-yapic/{avatar_id}/islands-200" if avatar_id else None

        # Апсерт пользователя
        user = await upsert_user_by_email(db, email=email, name=name, avatar_url=avatar_url)

        # Генерируем JWT
        jwt_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        token = create_access_token({"sub": str(user.id)}, expires_delta=jwt_expires)

        return AuthResponse(access_token=token, user=UserSchema.model_validate(user))

    # Для прочих провайдеров пока не реализовано
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Провайдер пока не реализован")


@router.get("/me", response_model=UserSchema)
async def get_current_user(current_user: UserSchema = Depends(get_current_user_dep)):
    """
    Получить информацию о текущем пользователе
    """
    return current_user

