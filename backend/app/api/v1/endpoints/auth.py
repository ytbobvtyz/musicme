"""
Endpoints для аутентификации
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from datetime import timedelta
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user as get_current_user_dep
from app.core.security import create_access_token
from app.schemas.auth import OAuthRequest, AuthResponse
from app.schemas.user import User as UserSchema
from app.crud.user import upsert_user_by_email

router = APIRouter()



@router.get("/yandex/login")
async def yandex_login_redirect():
    """
    Перенаправление на страницу авторизации Яндекс
    """
    # Проверяем что client_id загружен
    if not settings.YANDEX_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="YANDEX_CLIENT_ID not configured"
        )
    # Параметры для OAuth запроса к Яндекс
    params = {
        "response_type": "code",
        "client_id": settings.YANDEX_CLIENT_ID,
        "redirect_uri": "http://localhost:8000/api/v1/auth/yandex/callback",  # Яндекс вернёт сюда
        "scope": "login:email login:info",  # Запрашиваемые права
    }
    
    auth_url = f"https://oauth.yandex.ru/authorize?{urlencode(params)}"
    return RedirectResponse(url=auth_url)


@router.get("/yandex/callback")
async def yandex_callback(
    code: str = None,
    error: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Callback endpoint для обработки ответа от Яндекс
    """
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth error: {error}"
        )
    
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code parameter is missing"
        )
    
    try:
        # Используем существующую логику
        token_data = await _yandex_exchange_code_for_token(
            code, 
            "http://localhost:8000/api/v1/auth/yandex/callback"
        )
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось получить access_token"
            )

        profile = await _yandex_fetch_user_info(access_token)
        email = profile.get("default_email") or profile.get("emails", [None])[0]
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Профиль Yandex не содержит email"
            )

        name = profile.get("display_name") or profile.get("real_name") or None
        avatar_id = profile.get("default_avatar_id")
        avatar_url = f"https://avatars.yandex.net/get-yapic/{avatar_id}/islands-200" if avatar_id else None

        # Создаем/обновляем пользователя
        user = await upsert_user_by_email(db, email=email, name=name, avatar_url=avatar_url)

        # Генерируем JWT с данными пользователя
        jwt_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        token_payload = {
            "sub": str(user.id),
            "email": user.email,
            "name": user.name,
            "is_admin":user.is_admin,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
        token = create_access_token(token_payload, expires_delta=jwt_expires)

        # Перенаправляем на фронтенд с токеном
        frontend_url = f"http://localhost:3000/auth/callback?token={token}"
        return RedirectResponse(url=frontend_url)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )

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

