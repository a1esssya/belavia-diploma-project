# belavia-diploma-project

Web-прототип первой очереди модернизации post-booking self-service для авиакомпании «Белавиа».

## Что уже подготовлено на этом этапе

- Монорепозиторная структура с папками `frontend` и `backend`.
- Frontend: React.js SPA + React Router + Tailwind CSS (только каркас страниц и маршрутов).
- Backend: NestJS с обязательными модулями первой очереди (скелет контроллеров и health-эндпоинтов).
- PostgreSQL в `docker-compose`.
- Prisma schema и seed scaffolding.
- Примеры env-файлов.

> На текущем шаге реализован именно скелет проекта. Полная бизнес-логика (OTP, orders API, exchange/refund orchestration и т.д.) будет добавляться в следующих шагах.

## Структура проекта

```text
.
├── frontend/         # React + Tailwind SPA
├── backend/          # NestJS + Prisma
├── design/           # SVG-референсы и дизайн-спецификация
├── docker-compose.yml
└── .env.example
```

## Быстрый старт через Docker

1. Скопировать переменные окружения:

```bash
cp .env.example .env
```

2. Поднять контейнеры:

```bash
docker compose up --build
```

3. Приложения будут доступны:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/v1`
- PostgreSQL: `localhost:5432`

## Локальный запуск без Docker

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run start:dev
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Prisma и seed scaffolding

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Seed создаёт демонстрационного пользователя и несколько заказов для будущей реализации сценариев первой очереди.

## Scope-ограничения

В репозитории реализуется только первая очередь из `PROJECT_SPEC.md`:

- личный кабинет;
- документы и история;
- exchange/refund self-service;
- ограниченный booking lookup.

Вне scope: мобильное приложение, реальная PSS Leonardo, реальный платёжный шлюз и переработка purchase funnel.
