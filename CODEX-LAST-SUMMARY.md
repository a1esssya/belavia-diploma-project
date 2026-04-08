# Backend First-Phase Summary

## Scope

Реализована серверная часть первой очереди личного кабинета Belavia в рамках post-booking self-service:

- Prisma schema и миграция для минимального набора сущностей первой очереди
- seed-данные с тестовым пользователем, заказами, документами и историей
- AuthModule, OrdersModule, DocumentsModule, HistoryModule, ExchangeModule, RefundModule, BookingLookupModule, IntegrationsModule
- mock PSS Leonardo через backend gateway
- public API первой очереди
- idempotency для confirm exchange/refund
- рабочий `GET /health`

## Data Model

В Prisma реализованы:

- `users`
- `sessions`
- `user_order_links`
- `orders_showcase`
- `order_events`
- `exchange_operations`
- `refund_operations`
- `idempotency_keys`

Дополнительно используется таблица `order_documents` для функции доступа к документам и resend.

## Seed

Seed покрывает:

- 1 тестового пользователя: `demo@belavia.by`
- будущий заказ с доступным exchange/refund
- будущий заказ с exchange с доплатой
- будущий заказ с недоступным refund
- отменённый заказ
- заказ со сценарием ошибки commit на стороне mock PSS
- документы и стартовые события

## API

Готовые endpoints:

- `GET /health`
- `POST /v1/auth/login/start`
- `POST /v1/auth/login/verify`
- `POST /v1/auth/logout`
- `GET /v1/me`
- `GET /v1/orders`
- `GET /v1/orders/:orderId`
- `GET /v1/orders/:orderId/documents`
- `POST /v1/orders/:orderId/documents/resend`
- `GET /v1/orders/:orderId/events`
- `POST /v1/booking/lookup`
- `POST /v1/orders/:orderId/exchange/quote`
- `POST /v1/orders/:orderId/exchange/confirm`
- `GET /v1/exchange-operations/:operationId`
- `POST /v1/orders/:orderId/refund/quote`
- `POST /v1/orders/:orderId/refund/confirm`
- `GET /v1/refund-operations/:operationId`

## Verification

Последняя проверка:

- `npm.cmd run prisma:generate` — успешно
- `npm.cmd run build` — успешно
- исправлен DI wiring для `MockLeonardoGateway` в `ExchangeModule` и `RefundModule`
- подготовлены файлы smoke-check: `docs/backend-smoke-check.md` и `docs/backend-smoke-check.http`

## Local Check Commands

```powershell
docker compose up -d postgres
cd C:\diploma\belavia-diploma-project\backend
Copy-Item .env.example .env
npm install
npm.cmd run prisma:generate
npx prisma migrate reset --force
npm.cmd run prisma:seed
npm.cmd run build
npm.cmd run start:dev
```
