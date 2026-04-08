# belavia-diploma-project

Web-прототип первой очереди модернизации post-booking self-service для авиакомпании «Белавиа».

## Что уже подготовлено на этом этапе

- Монорепозиторная структура с папками `frontend` и `backend`.
- Frontend: React.js SPA + React Router + Tailwind CSS.
- Backend: NestJS с обязательными модулями первой очереди.
- PostgreSQL в `docker-compose`.
- Prisma schema и seed scaffolding.
- Шаблоны env-файлов в формате `.env.example`.

> На текущем шаге реализован именно скелет проекта. Полная бизнес-логика будет добавляться поэтапно.

## Структура проекта

```text
.
├── frontend/         # React + Tailwind SPA
├── backend/          # NestJS + Prisma
├── design/           # SVG-референсы и дизайн-спецификация
├── docker-compose.yml
└── .env.example      # опциональный шаблон для docker-compose
```

## Конфигурация окружения

В проекте используется только один формат шаблонов: `.env.example`.

- `backend/.env.example` -> обязателен для локального запуска backend, копируется в `backend/.env`.
- `frontend/.env.example` -> обязателен для локального запуска frontend, копируется в `frontend/.env`.
- `.env.example` в корне -> опционален и нужен только если вы хотите переопределить переменные `docker-compose` через корневой `.env`.

Корневой `.env` не обязателен: в `docker-compose.yml` для всех root-переменных уже заданы значения по умолчанию.

## Быстрый старт через Docker

1. При необходимости переопределите порты и параметры Postgres:

```bash
cp .env.example .env
```

2. Поднимите контейнеры:

```bash
docker compose up --build
```

Без корневого `.env` команда тоже работает, так как `docker-compose.yml` содержит дефолтные значения.

Приложения будут доступны:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/v1`
- Health-check: `http://localhost:3000/health`
- PostgreSQL: `localhost:5432`

`GET /health` исключён из global prefix и используется для локальной проверки scaffold.
Остальные backend-маршруты остаются под префиксом ` /v1 `, например `http://localhost:3000/v1/auth/health`.

## Локальный запуск без Docker

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run start:dev
```

### Frontend

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
