# Остановить все контейнеры
docker-compose down

# Остановить и удалить volumes (данные БД)
docker-compose down -v

# Посмотреть логи
docker-compose logs -f

# Посмотреть логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend

# Пересобрать контейнеры после изменений
docker-compose up --build

# Проверить статус контейнеров
docker-compose ps

# Перезапустить все сервисы
docker-compose restart

# Или остановить и запустить заново
docker-compose down
docker-compose up -d

# prod:

# Старт приложения 
docker-compose -f docker-compose.prod.yml up -d --build

# Пересобираем фронтенд
docker-compose -f docker-compose.prod.yml build frontend --no-cache

# Перезапускаем
docker-compose -f docker-compose.prod.yml up -d

docker logs musicme-frontend-1 --tail 5

ssh deploy@193.108.115.232
Тунель для БД:
ssh -L 5433:localhost:5432 deploy@193.108.115.232


🚀 Памятка: Перезапуск контейнеров на сервере
1. 📁 Изменён файл .env
bash
cd /opt/musicme

# Перезапускаем все сервисы чтобы подхватили новые переменные
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Или только сервисы которые используют .env
docker-compose -f docker-compose.prod.yml restart backend frontend
2. 🎨 Изменён Frontend
bash
cd /opt/musicme

# Пересобираем и перезапускаем только фронтенд
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml up -d frontend

# Проверяем
docker logs musicme-frontend-1 --tail 10
3. 🔧 Изменён Backend
bash
cd /opt/musicme

# Пересобираем и перезапускаем только бэкенд
docker-compose -f docker-compose.prod.yml build --no-cache backend
docker-compose -f docker-compose.prod.yml up -d backend

# Проверяем
docker logs musicme-backend-1 --tail 10
curl https://musicme.ru/api/v1/health
4. 🗄️ Изменена модель базы данных
bash
cd /opt/musicme

# Останавливаем бэкенд
docker-compose -f docker-compose.prod.yml stop backend

# Запускаем миграции (если используешь Alembic)
docker-compose -f docker-compose.prod.yml run --rm backend python -m alembic upgrade head

# Или запускаем инициализацию базы
docker-compose -f docker-compose.prod.yml run --rm backend python -m app.init_database

# Запускаем бэкенд обратно
docker-compose -f docker-compose.prod.yml start backend
5. 💥 Полная перезагрузка контейнеров
bash
cd /opt/musicme

# Полная пересборка и перезапуск
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Проверяем все сервисы
docker ps
curl https://musicme.ru/api/v1/health
6. 🐛 Проблемы с контейнерами
bash
# Просмотр логов
docker-compose -f docker-compose.prod.yml logs
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs backend

# Просмотр статуса
docker-compose -f docker-compose.prod.yml ps

# Принудительный перезапуск
docker-compose -f docker-compose.prod.yml restart
7. 🔄 Обновление кода с GitHub
bash
cd /opt/musicme

# Получаем свежий код
git pull origin main

# Пересобираем и запускаем
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
8. 🧹 Очистка системы
bash
# Остановить всё
docker-compose -f docker-compose.prod.yml down

# Очистить неиспользуемые образы
docker image prune -a -f

# Очистить volumes (осторожно!)
docker volume prune

# Полная очистка системы
docker system prune -a -f
📋 Быстрые команды для копирования:
bash
# Быстрый деплой фронтенда
cd /opt/musicme && git pull && docker-compose -f docker-compose.prod.yml build --no-cache frontend && docker-compose -f docker-compose.prod.yml up -d frontend

# Быстрый деплой бэкенда  
cd /opt/musicme && git pull && docker-compose -f docker-compose.prod.yml build --no-cache backend && docker-compose -f docker-compose.prod.yml up -d backend

# Проверка здоровья
curl https://musicme.ru/api/v1/health && echo " | " && curl -I https://musicme.ru


🚀🚀🚀 ОТКРЫВАЕМ БД

# На сервере:
ssh deploy@193.108.115.232
cd /opt/musicme

# Временно открываем порт PostgreSQL
docker-compose -f docker-compose.prod.yml stop postgres
docker run -d --name postgres-temp -p 5432:5432 \
  -e POSTGRES_DB=mysong \
  -e POSTGRES_USER=mysong_user \
  -e POSTGRES_PASSWORD=mysong_password \
  -v musicme_postgres_data:/var/lib/postgresql/data \
  postgres:15

# Теперь на ноутбуке SSH туннель будет работать:
ssh -L 5434:localhost:5432 deploy@193.108.115.232


🚀🚀🚀 Сброс порта:
# Найди PID процесса на порту 5433
sudo lsof -i :5433

# Или используй netstat
sudo netstat -tulpn | grep 5433

# Или ss
sudo ss -tulpn | grep 5433

sudo kill -9 1234


🚀🚀🚀 ЛОГИ НА СЕРВЕРЕ

# Основные логи контейнера
docker logs musicme-postgres-1

# Логи в реальном времени
docker logs -f musicme-postgres-1
docker logs -f musicme-backend-1

# Последние 50 строк
docker logs --tail 50 musicme-postgres-1

🚀🚀🚀 Обновляем права пользователя

docker-compose -f docker-compose.prod.yml exec postgres psql -U mysong_user -d mysong -c "
UPDATE users 
SET is_admin = true, is_producer = true 
WHERE email = 'ytbob@yandex.ru';

-- Проверяем что обновилось
SELECT email, is_admin, is_producer FROM users WHERE email = 'ytbob@yandex.ru';
"

