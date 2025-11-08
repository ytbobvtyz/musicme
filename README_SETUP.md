# Инструкция по запуску проекта

## Требования

- Docker и Docker Compose
- Node.js 18+ (для локальной разработки frontend)
- Python 3.11+ (для локальной разработки backend)

## Быстрый старт с Docker

1. **Клонируйте репозиторий и перейдите в директорию проекта**

2. **Создайте файл `.env` на основе `.env.example`**:
   ```bash
   cp .env.example .env
   # Отредактируйте .env и добавьте ваши API ключи
   ```

3. **Запустите все сервисы**:
   ```bash
   docker-compose up -d
   ```

4. **Откройте в браузере**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Документация: http://localhost:8000/docs

## Локальная разработка

### Backend

1. **Создайте виртуальное окружение**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # На Windows: venv\Scripts\activate
   ```

2. **Установите зависимости**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Запустите PostgreSQL** (через Docker):
   ```bash
   docker-compose up -d postgres
   ```

4. **Выполните миграции**:
   ```bash
   alembic upgrade head
   ```

5. **Запустите сервер**:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. **Установите зависимости**:
   ```bash
   cd frontend
   npm install
   ```

2. **Запустите dev-сервер**:
   ```bash
   npm run dev
   ```

## Структура проекта

```
mysong/
├── backend/              # FastAPI приложение
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Конфигурация, БД, безопасность
│   │   ├── models/      # SQLAlchemy модели
│   │   └── schemas/     # Pydantic схемы
│   ├── alembic/         # Миграции базы данных
│   ├── main.py          # Точка входа
│   └── requirements.txt
│
├── frontend/            # React приложение
│   ├── src/
│   │   ├── api/         # API клиенты
│   │   ├── components/  # React компоненты
│   │   ├── pages/       # Страницы
│   │   ├── store/       # Zustand store
│   │   └── types/       # TypeScript типы
│   └── package.json
│
├── docs/                # Документация
├── docker-compose.yml   # Docker конфигурация
└── .env.example         # Пример переменных окружения
```

## Следующие шаги

1. Настройте переменные окружения в `.env`
2. Создайте первую миграцию базы данных: `alembic revision --autogenerate -m "Initial migration"`
3. Примените миграции: `alembic upgrade head`
4. Реализуйте OAuth авторизацию
5. Интегрируйте Suno AI API
6. Настройте платежную систему ЮKassa

## Полезные команды

- `docker-compose logs -f` - просмотр логов
- `docker-compose down` - остановка всех сервисов
- `docker-compose ps` - статус сервисов
- `alembic revision --autogenerate -m "message"` - создание миграции
- `alembic upgrade head` - применение миграций
- `alembic downgrade -1` - откат последней миграции

