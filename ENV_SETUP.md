# Настройка переменных окружения

## Быстрый старт

1. **Скопируйте `.env.example` в `.env`**:
   ```bash
   cp .env.example .env
   ```

2. **Отредактируйте `.env` файл и настройте необходимые переменные**

## Обязательные переменные для разработки

### Минимальный набор для запуска:

```bash
# База данных (уже настроена в docker-compose.yml)
DATABASE_URL=postgresql+asyncpg://mysong_user:mysong_password@postgres:5432/mysong

# JWT секрет (можно оставить значение по умолчанию для разработки)
JWT_SECRET=dev-secret-key-change-in-production-use-strong-random-key

# Для разработки остальные переменные могут быть пустыми
```

## Генерация безопасного JWT_SECRET

Для production сгенерируйте безопасный ключ:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Или используйте OpenSSL:
```bash
openssl rand -hex 32
```

## Настройка внешних сервисов

### 1. Suno AI API

1. Зарегистрируйтесь на https://suno.ai
2. Получите API ключ
3. Добавьте в `.env`:
   ```bash
   SUNO_API_KEY=your-api-key-here
   ```

### 2. ЮKassa (Платежи)

1. Зарегистрируйтесь на https://yookassa.ru
2. Создайте магазин и получите Shop ID и Secret Key
3. Добавьте в `.env`:
   ```bash
   YOOKASSA_SHOP_ID=your-shop-id
   YOOKASSA_SECRET_KEY=your-secret-key
   ```

### 3. Telegram Bot (Уведомления)

1. Создайте бота через @BotFather в Telegram
2. Получите токен бота
3. Получите свой Chat ID (можно через @userinfobot)
4. Добавьте в `.env`:
   ```bash
   TELEGRAM_BOT_TOKEN=your-bot-token
   TELEGRAM_ADMIN_CHAT_ID=your-chat-id
   ```

### 4. OAuth провайдеры

#### VK OAuth:
1. Создайте приложение на https://vk.com/apps?act=manage
2. Получите Client ID и Client Secret
3. Добавьте в `.env`:
   ```bash
   VK_CLIENT_ID=your-client-id
   VK_CLIENT_SECRET=your-client-secret
   ```

#### Yandex OAuth:
1. Создайте приложение на https://oauth.yandex.ru
2. Получите Client ID и Client Secret
3. Добавьте в `.env`:
   ```bash
   YANDEX_CLIENT_ID=your-client-id
   YANDEX_CLIENT_SECRET=your-client-secret
   ```

#### Google OAuth:
1. Создайте проект на https://console.cloud.google.com
2. Создайте OAuth 2.0 credentials
3. Добавьте в `.env`:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### 5. SMTP (Email)

Настройте SMTP сервер для отправки email уведомлений:

```bash
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=your-email@yandex.ru
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@mysong-podarok.ru
```

**Для Yandex:**
- Используйте порт 587 (TLS)
- Создайте пароль приложения в настройках почты

**Для Gmail:**
- Используйте порт 587
- Включите двухфакторную аутентификацию
- Создайте пароль приложения

## Локальная разработка (без Docker)

Если вы запускаете backend локально (не в Docker), измените `DATABASE_URL`:

```bash
# Используйте localhost:5433 (порт из docker-compose.yml)
DATABASE_URL=postgresql+asyncpg://mysong_user:mysong_password@localhost:5433/mysong
```

## Проверка настроек

Проверьте, что переменные окружения загружены правильно:

```bash
# Запустите backend
cd backend
python -c "from app.core.config import settings; print(f'Database: {settings.DATABASE_URL[:30]}...')"
```

## Безопасность

⚠️ **ВАЖНО:**
- Никогда не коммитьте `.env` файл в Git
- Используйте `.env.example` для документирования переменных
- В production используйте сильные секретные ключи
- Храните секреты в защищенном хранилище (например, AWS Secrets Manager)

## Структура .env файла

`.env` файл уже содержит все необходимые переменные с комментариями. 
Просто заполните значения для сервисов, которые вы планируете использовать.

