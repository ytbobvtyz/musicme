"""
Утилиты для работы с JWT и безопасностью
"""
from datetime import datetime, timedelta
from typing import Optional, Any, Dict
from jose import JWTError, jwt, ExpiredSignatureError

from app.core.config import settings


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Создание JWT токена
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET,  # ← Используем то что есть в config.py
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None

# ДОПОЛНИТЕЛЬНО: Можно добавить для удобства
def create_user_access_token(user_id: str, **extra_data) -> str:
    """
    Создать access token для пользователя
    
    Args:
        user_id: ID пользователя
        **extra_data: Дополнительные данные для токена
    
    Returns:
        JWT токен
    """
    data = {"sub": user_id, **extra_data}
    return create_access_token(data)