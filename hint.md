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