# belavia-diploma-project

Web-прототип первой очереди модернизации post-booking self-service для авиакомпании «Белавиа».

## Текущее состояние проекта

- Монорепозиторная структура с папками `frontend` и `backend`.
- Frontend: React.js SPA + React Router + Tailwind CSS.
- Backend: NestJS с обязательными модулями первой очереди.
- PostgreSQL в `docker-compose`.
- Prisma schema, миграции и seed scaffolding.
- Шаблоны env-файлов в формате `.env.example`.
- Backend первой очереди уже реализован.
- Backend smoke-check уже подготовлен и пройден.
- Frontend first-wave ещё не реализован полностью.

## Что уже реализовано

- Этап 1 завершён: scaffold проекта, `docker-compose`, env-шаблоны, Prisma schema и seed scaffolding.
- Этап 2 завершён: backend первой очереди с обязательными модулями, mock Leonardo gateway, public API, idempotency для confirm-операций и seed-данными.
- Для backend подготовлены и задокументированы smoke-check артефакты: `docs/backend-smoke-check.md` и `docs/backend-smoke-check.http`.

## Что ещё не завершено

- Этап 3: frontend первой очереди.
- Этап 4: полный набор unit/integration/frontend/e2e тестов для всего проекта.

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

`GET /health` исключён из global prefix и используется для локальной проверки backend.
Остальные backend-маршруты остаются под префиксом `/v1`.

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

## Backend первой очереди

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

На текущем этапе backend уже покрывает первую очередь:

- email OTP авторизацию;
- список заказов и карточку заказа;
- документы и resend документов;
- историю событий;
- booking lookup;
- exchange/refund quote и confirm;
- обновление витрины заказа после операций;
- idempotency для confirm exchange/refund.

Сводка по последнему backend-шагу сохранена в `CODEX-LAST-SUMMARY.md`.

## Frontend first-wave

Frontend стек и базовая структура присутствуют, но первая очередь на frontend ещё не доведена до завершённого состояния. Следующий основной шаг проекта - реализация обязательных маршрутов, reusable UI-компонентов и связки с backend API по спецификации.

## Scope-ограничения

В репозитории реализуется только первая очередь из `PROJECT-SPEC.md`:

- личный кабинет;
- документы и история;
- exchange/refund self-service;
- ограниченный booking lookup.

Вне scope: мобильное приложение, реальная PSS Leonardo, реальный платёжный шлюз и переработка purchase funnel.
