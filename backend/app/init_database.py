"""
Скрипт для полной инициализации БД (создание таблиц + начальные данные)
"""
import asyncio
from app.core.database import init_db, AsyncSessionLocal
from app.models.theme import Theme
from app.models.genre import Genre
from app.models.tariff import Tariff  # ← ДОБАВЛЯЕМ ИМПОРТ
from sqlalchemy import select
from uuid import uuid4

# Начальные данные
initial_themes = [
    {"id": uuid4(), "name": "свадьба", "description": "Свадебные треки"},
    {"id": uuid4(), "name": "день рождения", "description": "Треки для дней рождений"},
    {"id": uuid4(), "name": "любовь", "description": "Романтические треки"},
    {"id": uuid4(), "name": "дружба", "description": "Треки о дружбе"},
    {"id": uuid4(), "name": "праздник", "description": "Треки для праздников и юбилеев"},
    {"id": uuid4(), "name": "новый год", "description": "Новогодние треки"},
    {"id": uuid4(), "name": "другое", "description": "Треки на заданную тему"},    
]

initial_genres = [
    {"id": uuid4(), "name": "поп", "description": "Поп-музыка"},
    {"id": uuid4(), "name": "рок", "description": "Рок-музыка"},
    {"id": uuid4(), "name": "классика", "description": "Классическая музыка"},
    {"id": uuid4(), "name": "электроника", "description": "Электронная музыка"},
    {"id": uuid4(), "name": "хип-хоп", "description": "Хип-хоп и рэп"},
    {"id": uuid4(), "name": "джаз", "description": "Джазовая музыка"},
    {"id": uuid4(), "name": "фолк", "description": "Фолк-музыка"},
    {"id": uuid4(), "name": "кантри", "description": "Кантри музыка"},
    {"id": uuid4(), "name": "другое", "description": "Треки по заданному стилю"},   
]

# ← ДОБАВЛЯЕМ НАЧАЛЬНЫЕ ДАННЫЕ ТАРИФОВ
initial_tariffs = [
    {
        "id": uuid4(),
        "code": "basic",
        "name": "Базовый", 
        "description": "Идеально для быстрых поздравлений",
        "price": 2900,
        "original_price": 3900,
        "deadline_days": 1,
        "rounds": 1,
        "has_questionnaire": False,
        "has_interview": False,
        "features": [
            "Песня до 3 минут",
            "1 раунд правок", 
            "Готовность за 24 часа",
            "Базовая персонализация"
        ],
        "badge": None,
        "popular": False,
        "is_active": True,
        "sort_order": 1
    },
    {
        "id": uuid4(),
        "code": "advanced",
        "name": "Продвинутый",
        "description": "Для особых моментов с глубокой персонализацией", 
        "price": 4900,
        "original_price": 5900,
        "deadline_days": 2,
        "rounds": 2,
        "has_questionnaire": True,
        "has_interview": False,
        "features": [
            "Песня до 4 минут",
            "2 раунда правок",
            "Готовность за 48 часов", 
            "Детальная анкета",
            "Углубленная персонализация",
            "Приоритет в очереди"
        ],
        "badge": "Популярный",
        "popular": True,
        "is_active": True,
        "sort_order": 2
    },
    {
        "id": uuid4(), 
        "code": "premium",
        "name": "Премиум",
        "description": "Эксклюзивная работа с персональным продюсером",
        "price": 9900,
        "original_price": 12900,
        "deadline_days": 3,
        "rounds": 999,  # неограниченно
        "has_questionnaire": True,
        "has_interview": True,
        "features": [
            "Песня до 5 минут",
            "Неограниченные правки",
            "Готовность за 72 часа",
            "Видео-интервью с продюсером", 
            "Эксклюзивная аранжировка",
            "Высший приоритет",
            "Персональный менеджер"
        ],
        "badge": "Эксклюзив",
        "popular": False,
        "is_active": True,
        "sort_order": 3
    }
]

async def initialize_database():
    """Полная инициализация БД: создание таблиц + начальные данные"""
    print("🚀 Начинаем инициализацию базы данных...")
    
    try:
        # 1. Сначала создаем таблицы
        print("📦 Создаем таблицы...")
        await init_db()
        print("✅ Таблицы созданы успешно!")
        
        # 2. Затем заполняем начальными данными
        print("📥 Заполняем начальными данными...")
        await seed_initial_data()
        
        print("🎉 Инициализация базы данных завершена успешно!")
        
    except Exception as e:
        print(f"❌ Ошибка при инициализации БД: {e}")
        raise

async def seed_initial_data():
    """Заполнить БД начальными данными"""
    async with AsyncSessionLocal() as session:
        try:
            # Проверяем, есть ли уже темы
            existing_themes = await session.execute(select(Theme))
            
            if existing_themes.scalars().first():
                print("✅ Темы уже существуют, пропускаем...")
            else:
                # Добавляем темы
                for theme_data in initial_themes:
                    theme = Theme(**theme_data)
                    session.add(theme)
                await session.commit()
                print(f"✅ Добавлено {len(initial_themes)} тем")
            
            # Проверяем, есть ли уже жанры
            existing_genres = await session.execute(select(Genre))
            
            if existing_genres.scalars().first():
                print("✅ Жанры уже существуют, пропускаем...")
            else:
                # Добавляем жанры
                for genre_data in initial_genres:
                    genre = Genre(**genre_data)
                    session.add(genre)
                await session.commit()
                print(f"✅ Добавлено {len(initial_genres)} жанров")
            
            # ← ДОБАВЛЯЕМ ПРОВЕРКУ И ЗАПОЛНЕНИЕ ТАРИФОВ
            existing_tariffs = await session.execute(select(Tariff))
            
            if existing_tariffs.scalars().first():
                print("✅ Тарифы уже существуют, пропускаем...")
            else:
                # Добавляем тарифы
                for tariff_data in initial_tariffs:
                    tariff = Tariff(**tariff_data)
                    session.add(tariff)
                await session.commit()
                print(f"✅ Добавлено {len(initial_tariffs)} тарифов")
                
        except Exception as e:
            await session.rollback()
            print(f"❌ Ошибка при заполнении данных: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(initialize_database())