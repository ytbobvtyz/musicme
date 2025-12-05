"""
Уведомления через Telegram бота
"""
import logging
from typing import Optional, List
from datetime import datetime
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from app.bot.bot import get_bot_instance
from app.core.database import AsyncSessionLocal
from app.crud.user import crud_user
from app.models.order import Order

logger = logging.getLogger(__name__)


async def send_order_created_notification(order: Order):
    """Отправить уведомление о создании заказа"""
    try:
        bot = await get_bot_instance()
        if not bot or not bot.bot:
            logger.warning("Бот не инициализирован, уведомление не отправлено")
            return False
        
        async with AsyncSessionLocal() as db:
            # Получаем пользователя
            user = await crud_user.get_by_id(db, order.user_id)
            if not user or not user.telegram_id:
                return False
            
            # Формируем сообщение
            text = (
                f"🎵 <b>Заказ #{order.id[:8]} создан!</b>\n\n"
                f"<b>Тариф:</b> {order.tariff_id}\n"
                f"<b>Сумма:</b> {order.price} руб.\n"
                f"<b>Срок выполнения:</b> 24-48 часов\n\n"
                f"Мы уже начали работать над вашей песней!\n"
                f"Уведомим, когда демо-версия будет готова."
            )
            
            keyboard = InlineKeyboardBuilder()
            keyboard.add(
                InlineKeyboardButton(
                    text="📋 Открыть заказ",
                    url=f"https://musicme.ru/order/{order.id}"
                )
            )
            
            # Отправляем пользователю
            await bot.bot.send_message(
                chat_id=user.telegram_id,
                text=text,
                reply_markup=keyboard.as_markup(),
                disable_web_page_preview=True
            )
            
            logger.info(f"Уведомление о создании заказа отправлено пользователю {user.telegram_id}")
            return True
            
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления о создании заказа: {e}")
        return False


async def send_order_ready_notification(order: Order):
    """Отправить уведомление о готовности демо-версии"""
    try:
        bot = await get_bot_instance()
        if not bot or not bot.bot:
            logger.warning("Бот не инициализирован, уведомление не отправлено")
            return False
        
        async with AsyncSessionLocal() as db:
            # Получаем пользователя
            user = await crud_user.get_by_id(db, order.user_id)
            if not user or not user.telegram_id:
                return False
            
            # Формируем сообщение
            text = (
                f"🎵 <b>Демо-версия готова!</b>\n\n"
                f"Заказ #{order.id[:8]} готов для прослушивания.\n\n"
                f"🎧 <a href='{order.preview_url}'>Прослушать 60-секундное демо</a>\n\n"
                f"<b>Что дальше?</b>\n"
                f"1. Прослушайте демо-версию\n"
                f"2. Если понравилось - оплатите полную версию\n"
                f"3. Если нужны правки - запросите их\n\n"
                f"<i>Срок действия демо: 7 дней</i>"
            )
            
            keyboard = InlineKeyboardBuilder()
            keyboard.add(
                InlineKeyboardButton(
                    text="🎵 Прослушать демо",
                    url=f"https://musicme.ru/track/{order.id}"
                ),
                InlineKeyboardButton(
                    text="💳 Перейти к оплате",
                    url=f"https://musicme.ru/payment/{order.id}"
                )
            )
            keyboard.adjust(1)
            
            # Отправляем пользователю
            await bot.bot.send_message(
                chat_id=user.telegram_id,
                text=text,
                reply_markup=keyboard.as_markup(),
                disable_web_page_preview=True
            )
            
            logger.info(f"Уведомление о готовности заказа отправлено пользователю {user.telegram_id}")
            return True
            
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления о готовности заказа: {e}")
        return False


async def send_admin_notification(text: str, chat_id: Optional[int] = None):
    """Отправить уведомление администратору"""
    try:
        bot = await get_bot_instance()
        if not bot or not bot.bot:
            logger.warning("Бот не инициализирован, уведомление не отправлено")
            return False
        
        # Если chat_id не указан, используем из конфигурации
        if not chat_id:
            chat_id = bot.get_config().admin_chat_id
        
        if not chat_id:
            logger.warning("Admin chat_id не настроен")
            return False
        
        await bot.bot.send_message(
            chat_id=chat_id,
            text=text,
            disable_web_page_preview=True
        )
        
        return True
        
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления администратору: {e}")
        return False