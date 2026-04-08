# Frontend First-Wave Summary

## Scope

Реализован frontend первой очереди личного кабинета Belavia поверх уже готового backend API:

- login по email OTP
- список заказов
- карточка заказа
- документы и resend документов
- история событий
- booking lookup без авторизации
- exchange quote-flow
- refund quote-flow

Подтверждение `confirm exchange/refund` не доводилось до финальной UI-полировки в рамках этого шага, как и было запрошено.

## Frontend Routes

Готовые маршруты:

- `/login`
- `/trips`
- `/orders/:orderId`
- `/orders/:orderId/documents`
- `/orders/:orderId/history`
- `/orders/:orderId/exchange`
- `/orders/:orderId/refund`
- `/booking-status`

## UI Components

Добавлены reusable React + Tailwind компоненты:

- `AppShell`
- `PageHeader`
- `PrimaryButton`
- `SecondaryButton`
- `TextInput`
- `StatusBadge`
- `OrderCard`
- `DocumentRow`
- `EventTimeline`
- `QuoteSummary`
- `EmptyState`
- `ErrorState`

## Frontend Architecture

Добавлено:

- API client для работы с backend
- auth/session state c `localStorage`
- protected routing для авторизованных страниц
- async data hooks для загрузки view models
- форматтеры и status-mappers для UI

Frontend работает только через backend API и не обращается к mock PSS напрямую.

## Verification

Проверки после реализации:

- `npm.cmd run build` — успешно
- `npm.cmd run test` — успешно

Frontend тесты:

- `src/lib/format.test.ts`
- `src/lib/status.test.ts`

## Current Status

Что уже работает:

- полный first-wave frontend для личного кабинета до уровня quote-flow
- связка страниц с backend первой очереди
- reusable UI system на React + Tailwind CSS

Что ещё не завершено:

- финальная UX-полировка confirm exchange/refund
- расширение frontend test coverage
- минимальные e2e для frontend-first сценариев
