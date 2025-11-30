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
from app.core.security import create_access_token, create_token_from_user  # ← ИМПОРТИРУЕМ НОВУЮ ФУНКЦИЮ
from app.schemas.auth import OAuthRequest, AuthResponse
from app.schemas.user import User as UserSchema
from app.crud.user import upsert_user_by_email, crud_user

router = APIRouter()

@router.get("/yandex/login")
async def yandex_login_redirect():
    """
    Перенаправление на страницу авторизации Яндекс
    """
    if not settings.YANDEX_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="YANDEX_CLIENT_ID not configured"
        )
    
    params = {
        "response_type": "code",
        "client_id": settings.YANDEX_CLIENT_ID,
        "redirect_uri": settings.YANDEX_REDIRECT_URL,
        "scope": "login:email login:info",
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
        token_data = await _yandex_exchange_code_for_token(
            code, 
            settings.YANDEX_REDIRECT_URL
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

        # ⬇️ ИСПОЛЬЗУЕМ НОВУЮ ФУНКЦИЮ ДЛЯ СОЗДАНИЯ ТОКЕНА
        token = create_token_from_user(user)

        # Перенаправляем на фронтенд с токеном
        frontend_url = f"{settings.FRONTEND_URL}/auth/callback?token={token}"
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Неподдерживаемый провайдер"
        )

    if provider == "yandex":
        # ... существующий код Яндекс ...
        token_data = await _yandex_exchange_code_for_token(oauth_data.code, oauth_data.redirect_uri)
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Не удалось получить access_token (Yandex)"
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

        user = await upsert_user_by_email(
            db, 
            email=email, 
            name=name, 
            avatar_url=avatar_url,
            registration_source="yandex_oauth"
        )
        token = create_token_from_user(user)
        return AuthResponse(access_token=token, user=UserSchema.model_validate(user))

    elif provider == "google":
        # НОВЫЙ КОД ДЛЯ GOOGLE
        token_data = await _google_exchange_code_for_token(oauth_data.code, oauth_data.redirect_uri)
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Не удалось получить access_token (Google)"
            )

        profile = await _google_fetch_user_info(access_token)
        email = profile.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Профиль Google не содержит email"
            )

        name = profile.get("name")
        avatar_url = profile.get("picture")

        user = await upsert_user_by_email(
            db, 
            email=email, 
            name=name, 
            avatar_url=avatar_url,
            registration_source="google_oauth"
        )
        token = create_token_from_user(user)
        return AuthResponse(access_token=token, user=UserSchema.model_validate(user))

    # Для VK пока не реализовано
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED, 
        detail="Провайдер VK пока не реализован"
    )

@router.get("/me", response_model=UserSchema)
async def get_current_user(current_user: UserSchema = Depends(get_current_user_dep)):
    """
    Получить информацию о текущем пользователе
    """
    return current_user

from app.schemas.telegram import TelegramAuth

@router.post("/telegram", response_model=AuthResponse)
async def auth_telegram(
    telegram_data: TelegramAuth,
    db: AsyncSession = Depends(get_db)
):
    """
    Авторизация через Telegram Login Widget
    """
    # TODO: Реализовать проверку hash
    # Пока пропускаем для тестирования
    
    # Ищем пользователя по telegram_id
    user = await crud_user.get_by_telegram_id(db, telegram_data.id)
    
    if not user:
        # Создаем нового пользователя
        user = await crud_user.create_telegram_user(db, telegram_data)
    else:
        # Обновляем данные существующего пользователя
        user = await crud_user.update_telegram_data(db, user.id, telegram_data)
    
    # ⬇️ ИСПОЛЬЗУЕМ НОВУЮ ФУНКЦИЮ ДЛЯ СОЗДАНИЯ ТОКЕНА
    token = create_token_from_user(user)
    
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=user
    )

@router.get("/google/login")
async def google_login_redirect():
    """
    Перенаправление на страницу авторизации Google
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GOOGLE_CLIENT_ID not configured"
        )
    
    params = {
        "response_type": "code",
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URL,
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url=auth_url)

@router.get("/google/callback")
async def google_callback(
    code: str = None,
    error: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Callback endpoint для обработки ответа от Google
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
        token_data = await _google_exchange_code_for_token(
            code, 
            settings.GOOGLE_REDIRECT_URL
        )
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось получить access_token от Google"
            )

        profile = await _google_fetch_user_info(access_token)
        email = profile.get("email")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Профиль Google не содержит email"
            )

        name = profile.get("name")
        avatar_url = profile.get("picture")

        # Создаем/обновляем пользователя
        user = await upsert_user_by_email(
            db, 
            email=email, 
            name=name, 
            avatar_url=avatar_url,
            registration_source="google_oauth"
        )

        token = create_token_from_user(user)

        # Перенаправляем на фронтенд с токеном
        frontend_url = f"{settings.FRONTEND_URL}/auth/callback?token={token}"
        return RedirectResponse(url=frontend_url)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )

async def _google_exchange_code_for_token(code: str, redirect_uri: str) -> dict:
    """
    Обмен кода на access_token в Google OAuth
    """
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(token_url, data=data, headers=headers)
        if r.status_code != 200:
            error_detail = r.json().get("error_description", "Unknown error")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Ошибка обмена кода на токен (Google): {error_detail}"
            )
        return r.json()

async def _google_fetch_user_info(access_token: str) -> dict:
    """
    Получение информации о пользователе Google
    """
    info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(info_url, headers=headers)
        if r.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Ошибка получения профиля (Google)"
            )
        return r.json()