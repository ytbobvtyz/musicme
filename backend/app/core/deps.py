"""
Зависимости FastAPI (получение текущего пользователя и т.п.)
"""
from typing import Optional
from uuid import UUID
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_token  # ваша существующая функция
from app.crud.user import crud_user
from app.models.user import User

# Схема аутентификации через Bearer token (стандартный подход FastAPI)
oauth2_scheme = HTTPBearer(auto_error=False)  # auto_error=False для опциональной версии

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Получение текущего пользователя из JWT (Authorization: Bearer <token>)
    Стандартный подход FastAPI с HTTPBearer
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется авторизация",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Используем вашу существующую функцию verify_token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный или истекший токен",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный формат токена",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await crud_user.get_by_id(db, UUID(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Получение текущего пользователя с проверкой прав администратора
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав. Требуются права администратора."
        )
    return current_user

async def get_current_producer(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Получение текущего пользователя с проверкой прав продюсера
    """
    if not current_user.is_producer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав. Требуются права продюсера."
        )
    return current_user