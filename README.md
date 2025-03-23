# Another Knowledge Base

## Технологии

- Node.js
- TypeScript
- NestJS
- TypeORM
- MySQL
- Jest
- Docker

## Требования

- Node.js 20+
- Docker и Docker Compose
- MySQL (при локальном запуске)

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/zendau/another-knowledge-base.git
cd another-knowledge-base
```

2. Установите зависимости:
```bash
npm install
```

3. Настройка окружения:
Проект использует разные конфигурационные файлы для разных окружений в директории `config/env/`:
   - Скопируйте `.env.example` в `.env.dev` для разработки или `.env.prod` для продакшена
   - Настройте переменные окружения в созданном файле:
```env
# База данных
DB_HOST=localhost
DB_PORT=3306
DB_USER=user
DB_PASS=password
DB_ROOT_PASS=root
DB_NAME=knowledge_base
DB_SYNC=true

# JWT
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=1h

# Безопасность
SALT=10
```

4. Запуск:

С Docker:
```bash
# Разработка
docker-compose -f docker-compose.dev.yml up

# Продакшн
docker-compose up
```

Без Docker:
```bash
# Разработка
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

## Тестирование

```bash
# Модульные тесты
npm run test

# Покрытие тестами
npm run test:cov
```

