# AGENTS.md

## Роль агента

Ты работаешь как code generation agent в дипломном проекте по модернизации системы продажи билетов авиакомпании «Белавиа».

Твоя задача — реализовать только первую очередь модернизации и не выходить за её границы.

## Главная цель

Собрать работающий web-прототип личного кабинета как ядра post-booking self-service.

## Жёсткие ограничения

Нельзя:

- реализовывать вторую очередь;
- реализовывать третью очередь;
- добавлять мобильное приложение;
- перерабатывать поиск и покупку билета;
- подключать реальную PSS Leonardo;
- подключать реальный платёжный шлюз;
- переносить бизнес-логику exchange/refund на frontend;
- обращаться из frontend напрямую к mock PSS;
- придумывать дополнительные продуктовые модули вне scope.

## Обязательный стек

Использовать только:

- Frontend: React.js SPA
- Styling: Tailwind CSS
- Backend: Node.js + NestJS
- Database: PostgreSQL
- ORM: Prisma
- Integration: mock API PSS Leonardo

## Продуктовые функции первой очереди

Обязательно реализовать:

- авторизацию по email OTP;
- список заказов;
- карточку заказа;
- доступ к документам;
- повторную отправку документов;
- историю событий по заказу;
- проверку доступности обмена;
- проверку доступности возврата;
- расчёт exchange quote;
- расчёт refund quote;
- confirm exchange;
- confirm refund;
- обновление заказа, документов и истории после операции;
- альтернативный ограниченный booking lookup.

## Архитектурные правила

1. Frontend отвечает только за UI, маршруты и вызовы backend API.
2. Backend отвечает за бизнес-логику, авторизацию, историю событий, доступы, exchange/refund orchestration.
3. Mock PSS Leonardo подключается только через backend adapter/gateway.
4. Backend должен возвращать стабильные view models, а не сырые данные mock PSS.
5. После каждой значимой операции должно создаваться событие в истории.
6. Confirm endpoints должны быть защищены от двойного вызова через idempotency.

## Обязательные backend-модули

- AuthModule
- OrdersModule
- DocumentsModule
- HistoryModule
- ExchangeModule
- RefundModule
- BookingLookupModule
- IntegrationsModule

## Обязательные frontend-маршруты

- /login
- /trips
- /orders/:orderId
- /orders/:orderId/documents
- /orders/:orderId/history
- /orders/:orderId/exchange
- /orders/:orderId/refund
- /booking-status

## Работа с дизайном

Используй SVG-макеты из папки `design/screens` как визуальные референсы.

Важно:

- не делай pixel-perfect копирование SVG;
- сохраняй общую композицию, стиль и смысл экранов;
- исправляй кривые отступы, выравнивание и несистемные размеры;
- строй более чистую и единую UI-систему;
- все стили реализуй через Tailwind CSS;
- повторяющиеся элементы выноси в reusable React components.

Если в SVG есть неоднозначности, выбирай более аккуратное и системное решение, не ломая пользовательский сценарий.

## Источник правды по дизайну

Приоритет дизайн-источников:

1. PROJECT-SPEC.md
2. design/DESIGN-SPEC.md
3. design/screens/\*
4. локальные решения агента

## Порядок работы

Работай по этапам.

### Этап 1. Скелет проекта

Создай:

- frontend;
- backend;
- docker-compose;
- env.example;
- базовый README;
- Prisma schema;
- seed scaffolding.

### Этап 2. Backend

Реализуй:

- модели данных;
- миграции;
- seed-данные;
- mock Leonardo gateway;
- public API.

### Этап 3. Frontend

Реализуй:

- страницы;
- переиспользуемые UI-компоненты;
- связку с backend API.

### Этап 4. Testing

Добавь:

- unit tests для backend;
- integration tests для API;
- базовые frontend tests;
- минимальные e2e.

## Формат ответа агента

После каждого крупного шага:

- перечисли созданные файлы;
- перечисли изменённые файлы;
- коротко опиши, что уже работает;
- явно укажи, что ещё не реализовано.
