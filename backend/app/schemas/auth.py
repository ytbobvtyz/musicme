"""
Схемы аутентификации
"""
from pydantic import BaseModel, HttpUrl

from app.schemas.user import User


class OAuthRequest(BaseModel):
    """Запрос OAuth авторизации"""
    code: str
    redirect_uri: HttpUrl


class AuthResponse(BaseModel):
    """Ответ при авторизации"""
    access_token: str
    token_type: str = "bearer"
    user: User

