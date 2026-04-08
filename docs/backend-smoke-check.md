# Backend Smoke Check

## Purpose

Этот файл нужен для быстрой ручной проверки backend первой очереди локально, без изменения бизнес-логики.

Base URL:

- `http://localhost:3000`
- API prefix: `http://localhost:3000/v1`

Health-check:

- `GET http://localhost:3000/health`

## Реализованные endpoints

### Public

- `GET /health`
- `POST /v1/auth/login/start`
- `POST /v1/auth/login/verify`
- `POST /v1/booking/lookup`
- `GET /v1/auth/health`
- `GET /v1/booking/health`
- `GET /v1/integrations/health`

### Require Authorization

Все endpoints ниже требуют `Authorization: Bearer <accessToken>`:

- `POST /v1/auth/logout`
- `GET /v1/me`
- `GET /v1/orders`
- `GET /v1/orders/:orderId`
- `GET /v1/orders/:orderId/documents`
- `POST /v1/orders/:orderId/documents/resend`
- `GET /v1/orders/:orderId/events`
- `POST /v1/orders/:orderId/exchange/quote`
- `POST /v1/orders/:orderId/exchange/confirm`
- `GET /v1/exchange-operations/:operationId`
- `POST /v1/orders/:orderId/refund/quote`
- `POST /v1/orders/:orderId/refund/confirm`
- `GET /v1/refund-operations/:operationId`

Confirm endpoints дополнительно требуют заголовок:

- `Idempotency-Key: <unique-value>`

## Seed test data

Тестовый пользователь:

- email: `demo@belavia.by`
- OTP генерируется при `POST /v1/auth/login/start`
- в non-production окружении backend возвращает `otpDebugCode`, его можно сразу использовать для `POST /v1/auth/login/verify`

Тестовые заказы из seed:

- `B2FLEX` / ticket `421000000101`
  сценарий: будущий заказ
  passenger: `IVAN IVANOV`
  route: `MSQ → IST`
  exchange: доступен без доплаты
  refund: доступен

- `B2PAY1` / ticket `421000000102`
  сценарий: будущий заказ
  passenger: `ANNA PETROVA`
  route: `MSQ → TBS`
  exchange: доступен с доплатой
  refund: доступен

- `B2NREF` / ticket `421000000103`
  сценарий: будущий заказ
  passenger: `SERGEY SMIRNOV`
  route: `MSQ → AYT`
  exchange: доступен
  refund: недоступен

- `B2CANC` / ticket `421000000104`
  сценарий: отменённый заказ
  passenger: `OLGA SOKOLOVA`
  route: `MSQ → LED`

- `B2FAIL` / ticket `421000000105`
  сценарий: будущий заказ с ошибкой commit на стороне mock PSS
  passenger: `MARIA KOZLOVA`
  route: `MSQ → DXB`

Документы:

- seed создаёт документы по заказам в mock-URL формате `https://mock-leonardo.local/documents/...`
- resend обновляет время отправки и пишет событие в историю

Стартовая история:

- seed создаёт `order.seeded`
- для отдельных заказов дополнительно создаются `documents.sent`, `exchange.available`, `refund.blocked`, `order.cancelled`

## Рекомендуемый smoke flow

1. Проверить `GET /health`
2. Выполнить `POST /v1/auth/login/start` для `demo@belavia.by`
3. Взять `otpDebugCode` из ответа
4. Выполнить `POST /v1/auth/login/verify` и сохранить `accessToken`
5. Проверить `GET /v1/me`
6. Проверить `GET /v1/orders`
7. Взять `orderId` нужного заказа из ответа списка
8. Проверить `GET /v1/orders/:orderId`
9. Проверить `GET /v1/orders/:orderId/documents`
10. Проверить `POST /v1/orders/:orderId/documents/resend`
11. Проверить `GET /v1/orders/:orderId/events`
12. Для `B2FLEX` или `B2PAY1` проверить exchange quote/confirm
13. Для `B2NREF` проверить refund quote как blocked/unavailable сценарий
14. Для `B2FAIL` проверить сценарий ошибки commit
15. Отдельно проверить `POST /v1/booking/lookup` по `PNR + фамилия`

## Локальный запуск

```powershell
docker compose up -d postgres
cd C:\diploma\belavia-diploma-project\backend
Copy-Item .env.example .env
npm install
npm.cmd run prisma:generate
npx prisma migrate reset --force
npm.cmd run prisma:seed
npm.cmd run start:dev
```

## HTTP file

Для готовых ручных запросов используйте:

- [docs/backend-smoke-check.http](C:\diploma\belavia-diploma-project\docs\backend-smoke-check.http)
