"""
Скрипт для наполнения БД начальными данными
"""
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.theme import Theme
from app.models.genre import Genre
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

async def seed_initial_data():
    """Заполнить БД начальными данными"""
    async with AsyncSessionLocal() as session:
        try:
            # Проверяем, есть ли уже темы
            existing_themes = await session.execute(select(Theme))
            existing_genres = await session.execute(select(Genre))
            
            if existing_themes.scalars().first():
                print("✅ Темы уже существуют, пропускаем...")
            else:
                # Добавляем темы
                for theme_data in initial_themes:
                    theme = Theme(**theme_data)
                    session.add(theme)
                await session.commit()
                print(f"✅ Добавлено {len(initial_themes)} тем")
            
            if existing_genres.scalars().first():
                print("✅ Жанры уже существуют, пропускаем...")
            else:
                # Добавляем жанры
                for genre_data in initial_genres:
                    genre = Genre(**genre_data)
                    session.add(genre)
                await session.commit()
                print(f"✅ Добавлено {len(initial_genres)} жанров")
                
            print("🎉 Начальные данные успешно добавлены!")
                
        except Exception as e:
            await session.rollback()
            print(f"❌ Ошибка при заполнении данных: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(seed_initial_data())