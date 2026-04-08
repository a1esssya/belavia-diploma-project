# belavia-diploma-project

Рабочий scaffold первой очереди модернизации: React + Tailwind frontend, NestJS backend, PostgreSQL + Prisma.

## Быстрый запуск

1. Скопировать env-файлы:
   - `cp env.example .env`
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
2. Поднять PostgreSQL:
   - `docker compose up -d postgres`
3. Установить зависимости:
   - `cd backend && npm install`
   - `cd frontend && npm install`
4. Выполнить Prisma:
   - `cd backend && npx prisma migrate dev --name init`
   - `cd backend && npm run prisma:seed`
5. Запустить backend и frontend (в отдельных терминалах):
   - `cd backend && npm run start:dev`
   - `cd frontend && npm run dev`

## Проверка

- Backend health-check: `GET http://localhost:3000/health`
- Frontend стартовая страница: `http://localhost:5173`
