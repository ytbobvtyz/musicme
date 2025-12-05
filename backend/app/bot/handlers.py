"""
Обработчики команд Telegram бота
"""
import logging
from typing import Optional
from aiogram import Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from app.core.database import AsyncSessionLocal
from app.crud.user import crud_user
from app.crud.order import crud_order

logger = logging.getLogger(__name__)


async def start_handler(message: Message):
    """Обработчик команды /start"""
    welcome_text = """
🎵 <b>Добро пожаловать в MusicMe.ru!</b>

Создайте уникальную песню в подарок для близких!

<b>Основные возможности:</b>
• Создание персонализированных песен
• 3 тарифа на любой бюджет
• Оплата только если понравится
• Поддержка и консультации

<b>Полезные команды:</b>
/orders - Мои заказы  
/help - Помощь и поддержка
/about - О сервисе

<b>Создать заказ:</b>
🌐 <a href="https://musicme.ru">musicme.ru</a>
    """
    
    keyboard = InlineKeyboardBuilder()
    keyboard.add(
        InlineKeyboardButton(
            text="🎵 Создать песню", 
            url="https://musicme.ru"
        ),
        InlineKeyboardButton(
            text="📋 Примеры работ", 
            url="https://musicme.ru/examples"
        ),
        InlineKeyboardButton(
            text="💬 Поддержка", 
            callback_data="support"
        )
    )
    keyboard.adjust(1)
    
    await message.answer(
        welcome_text,
        reply_markup=keyboard.as_markup(),
        disable_web_page_preview=True
    )


async def orders_handler(message: Message):
    """Показать заказы пользователя"""
    async with AsyncSessionLocal() as db:
        # Находим пользователя по Telegram ID
        user = await crud_user.get_by_telegram_id(db, message.from_user.id)
        
        if not user:
            await message.answer(
                "📝 <b>Вы еще не создавали заказы</b>\n\n"
                "Для создания первой песни:\n"
                "1. Перейдите на сайт\n"
                "2. Выберите тариф\n"
                "3. Заполните форму\n\n"
                "🌐 <a href='https://musicme.ru'>Создать заказ</a>"
            )
            return
        
        # Получаем заказы пользователя
        orders = await crud_order.get_by_user(db, user.id)
        
        if not orders:
            await message.answer(
                "📭 <b>У вас пока нет заказов</b>\n\n"
                "Создайте первую песню на сайте:\n"
                "🌐 <a href='https://musicme.ru'>musicme.ru</a>"
            )
            return
        
        # Группируем заказы по статусу
        from collections import defaultdict
        orders_by_status = defaultdict(list)
        
        for order in orders:
            orders_by_status[order.status].append(order)
        
        response_text = "<b>📋 Ваши заказы</b>\n\n"
        
        # Статусы в порядке важности
        status_order = [
            ("ready_for_review", "🎵 Готово для прослушивания"),
            ("payment_pending", "💳 Ожидает оплаты"),
            ("in_progress", "⚙️ В работе"),
            ("draft", "📝 Черновик"),
            ("paid", "✅ Оплачено"),
            ("completed", "🎉 Завершено")
        ]
        
        for status_key, status_name in status_order:
            if status_key in orders_by_status:
                response_text += f"<b>{status_name}:</b>\n"
                
                for order in orders_by_status[status_key][:3]:  # Показываем до 3 заказов каждого статуса
                    order_link = f"https://musicme.ru/order/{order.id}"
                    
                    response_text += (
                        f"• <a href='{order_link}'>Заказ #{order.id[:8]}</a>\n"
                        f"  Тариф: {order.tariff_id}\n"
                        f"  Создан: {order.created_at.strftime('%d.%m.%Y')}\n"
                    )
                    
                    if order.preview_url and status_key == "ready_for_review":
                        response_text += f"  🎧 <a href='{order.preview_url}'>Прослушать демо</a>\n"
                    
                    response_text += "\n"
        
        if len(orders) > 10:
            response_text += f"<i>И еще {len(orders) - 10} заказов...</i>\n\n"
        
        response_text += (
            "🌐 <a href='https://musicme.ru/orders'>Все заказы на сайте</a>\n"
            "📱 Или используйте команду /status [номер_заказа]"
        )
        
        keyboard = InlineKeyboardBuilder()
        keyboard.add(
            InlineKeyboardButton(
                text="🌐 Открыть сайт", 
                url="https://musicme.ru/orders"
            )
        )
        
        await message.answer(
            response_text,
            reply_markup=keyboard.as_markup(),
            disable_web_page_preview=True
        )


async def help_handler(message: Message):
    """Обработчик команды /help"""
    help_text = """
<b>💬 Помощь и поддержка</b>

<b>Основные команды:</b>
/start - Начало работы
/orders - Мои заказы
/status [номер] - Статус заказа
/about - О сервисе

<b>Контакты поддержки:</b>
✉️ Email: support@musicme.ru
📱 Telegram: @musicme_support

<b>Частые вопросы:</b>
• <b>Сроки:</b> 24-48 часов для демо-версии
• <b>Оплата:</b> Только после одобрения демо
• <b>Правки:</b> Включены в стоимость
• <b>Форматы:</b> MP3 + текст песни

<b>Рабочее время:</b>
Пн-Пт: 10:00-20:00 (МСК)
Сб-Вс: 12:00-18:00 (МСК)
    """
    
    keyboard = InlineKeyboardBuilder()
    keyboard.add(
        InlineKeyboardButton(
            text="📖 Частые вопросы", 
            url="https://musicme.ru/faq"
        ),
        InlineKeyboardButton(
            text="✉️ Написать в поддержку", 
            url="https://t.me/musicme_support"
        )
    )
    keyboard.adjust(1)
    
    await message.answer(help_text, reply_markup=keyboard.as_markup())


async def about_handler(message: Message):
    """Обработчик команды /about"""
    about_text = """
<b>🎵 О сервисе MusicMe.ru</b>

<b>Наша миссия:</b>
Создавать уникальные эмоциональные подарки 
в виде персонализированных песен.

<b>Как это работает:</b>
1. Вы выбираете тариф и заполняете форму
2. Наш ИИ создает уникальную песню
3. Вы слушаете 60-секундное демо
4. Оплачиваете только если понравилось
5. Получаете полную версию

<b>Наши преимущества:</b>
✓ Без предоплаты - платите только за результат
✓ 3 тарифа на любой бюджет
✓ Профессиональные продюсеры
✓ Быстрые сроки (24-48 часов)
✓ Неограниченные правки на премиум-тарифе

<b>Тарифы:</b>
• Базовый (2,900 ₽) - для друзей
• Продвинутый (4,900 ₽) - для близких  
• Премиум (9,900 ₽) - для особых случаев

<b>Создано песен:</b> 150+
<b>Довольных клиентов:</b> 120+
<b>Средняя оценка:</b> 4.8/5

🌐 <a href="https://musicme.ru">Официальный сайт</a>
    """
    
    await message.answer(about_text, disable_web_page_preview=True)


async def status_handler(message: Message):
    """Проверка статуса заказа"""
    args = message.text.split()
    
    if len(args) < 2:
        await message.answer(
            "❌ <b>Укажите номер заказа</b>\n\n"
            "Пример: <code>/status ORDER123</code>\n\n"
            "<b>Где найти номер заказа?</b>\n"
            "1. В письме на email\n"
            "2. На сайте в разделе 'Мои заказы'\n"
            "3. В подтверждении заказа в Telegram\n\n"
            "Или используйте <code>/orders</code> для списка заказов"
        )
        return
    
    order_id = args[1].upper()
    
    async with AsyncSessionLocal() as db:
        order = await crud_order.get(db, order_id)
        
        if not order:
            await message.answer(
                f"❌ <b>Заказ {order_id} не найден</b>\n\n"
                "Проверьте номер заказа или:\n"
                "1. Используйте /orders для списка ваших заказов\n"
                "2. Обратитесь в поддержку /help"
            )
            return
        
        # Проверяем что пользователь имеет доступ к заказу
        user = await crud_user.get_by_telegram_id(db, message.from_user.id)
        if not user or order.user_id != user.id:
            await message.answer(
                "❌ <b>Нет доступа к этому заказу</b>\n\n"
                "Этот заказ принадлежит другому пользователю."
            )
            return
        
        # Информация о статусе
        status_info = {
            "draft": ("📝 Черновик", "Заказ создан, но еще не отправлен в работу"),
            "waiting_interview": ("📅 Ожидает интервью", "Запланировано видео-интервью для премиум-тарифа"),
            "in_progress": ("⚙️ В работе", "Наши продюсеры создают вашу песню"),
            "ready_for_review": ("🎵 Готово для прослушивания", "Демо-версия готова! Прослушайте и решите, нравится ли результат"),
            "payment_pending": ("💳 Ожидает оплаты", "Вы одобрили демо, ожидается оплата полной версии"),
            "paid": ("✅ Оплачено", "Оплата получена, готовим полную версию"),
            "ready_for_final_review": ("🎶 Готов финальный вариант", "Полная версия готова для скачивания"),
            "completed": ("🎉 Завершено", "Заказ успешно выполнен, песня доставлена"),
            "revision_requested": ("🔧 Правки запрошены", "Вы запросили правки, мы работаем над ними")
        }
        
        status_emoji, status_description = status_info.get(
            order.status, 
            ("⏳ Неизвестный статус", "Статус заказа не определен")
        )
        
        # Формируем ответ
        response = (
            f"<b>📊 Статус заказа #{order_id}</b>\n\n"
            f"<b>Статус:</b> {status_emoji} {status_description}\n"
            f"<b>Тариф:</b> {order.tariff_id}\n"
            f"<b>Создан:</b> {order.created_at.strftime('%d.%m.%Y %H:%M')}\n"
        )
        
        if order.deadline:
            from datetime import datetime
            days_left = (order.deadline - datetime.now()).days
            if days_left > 0:
                response += f"<b>⏳ До готовности:</b> {days_left} дн.\n"
        
        if order.preview_url:
            response += f"\n🎧 <a href='{order.preview_url}'>Прослушать демо-версию</a>\n"
        
        # Кнопки действий в зависимости от статуса
        keyboard = InlineKeyboardBuilder()
        
        if order.status == "ready_for_review":
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
        elif order.status in ["paid", "ready_for_final_review"]:
            keyboard.add(
                InlineKeyboardButton(
                    text="📥 Скачать полную версию", 
                    url=f"https://musicme.ru/track/{order.id}/download"
                )
            )
        else:
            keyboard.add(
                InlineKeyboardButton(
                    text="🌐 Открыть на сайте", 
                    url=f"https://musicme.ru/order/{order.id}"
                )
            )
        
        keyboard.adjust(1)
        
        await message.answer(
            response,
            reply_markup=keyboard.as_markup(),
            disable_web_page_preview=True
        )


async def register_handlers(dp: Dispatcher):
    """Регистрация всех обработчиков"""
    dp.message.register(start_handler, Command("start"))
    dp.message.register(orders_handler, Command("orders"))
    dp.message.register(help_handler, Command("help"))
    dp.message.register(about_handler, Command("about"))
    dp.message.register(status_handler, Command("status"))
    
    logger.info("Обработчики команд Telegram бота зарегистрированы")