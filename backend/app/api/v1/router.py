"""
Главный роутер API v1
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, orders, tracks, payments, admin

api_router = APIRouter()

# Подключение роутеров
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(tracks.router, prefix="/tracks", tags=["tracks"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

from app.api.v1.endpoints import test
api_router.include_router(test.router, prefix="/test", tags=["test"])