# Orders 500 Fix Summary

## Scope

Выполнена системная delta-правка для устранения `Internal server error` на странице поездок после успешного входа.

## Root Cause

Причина была в рассинхроне между backend-кодом и реальной схемой PostgreSQL:

- модель `orders_showcase` была расширена полями `baggageSummary` и `ancillaries`;
- Prisma schema и backend-код уже ожидали эти поля;
- миграция `20260409093000_add_baggage_and_ancillaries` в локальную БД не была применена;
- из-за этого `GET /v1/orders` падал на запросе к таблице и frontend показывал `Internal server error`.

Это был не частный баг маршрута `/orders`, а системная проблема запуска backend после изменений схемы.

## Fix

Исправлено:

- в backend добавлен обязательный шаг `prisma migrate deploy` перед стартом сервера;
- `start:dev` теперь выполняет:
  - `prisma generate`
  - `prisma migrate deploy`
  - затем запуск NestJS;
- `start` теперь тоже применяет миграции перед запуском;
- pending migration `20260409093000_add_baggage_and_ancillaries` применена к локальной БД.

## Files Changed

- `backend/package.json`
- `CODEX-LAST-SUMMARY.md`

## Verification

Проверки после изменений:

- в таблице `orders_showcase` теперь есть колонки:
  - `baggageSummary`
  - `ancillaries`
- `POST /v1/auth/login/start` — успешно
- `GET /v1/orders` с валидным access token — успешно, статус `200`
- `backend`: `npm.cmd run build` — успешно

## Current Status

Что уже работает:

- login flow проходит;
- после входа trips list больше не падает на `Internal server error`;
- backend теперь системно доводит БД до нужной схемы перед запуском.

Что ещё не реализовано:

- отдельные e2e-проверки login -> trips;
- любые second-wave и third-wave сценарии по-прежнему вне scope.
