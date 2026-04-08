import { PlaceholderPage } from './page-factory';

export function ExchangePage() {
  return (
    <PlaceholderPage
      title="Exchange"
      subtitle="Пошаговый каркас сценария exchange: eligibility, quote и confirm в рамках первой очереди."
      blocks={[
        { title: 'Eligibility check', description: 'Проверка доступности обмена до расчёта.' },
        { title: 'Quote preview', description: 'Блок расчёта с доплатой/возвратом до confirm.' },
        { title: 'Confirm operation', description: 'Подтверждение операции с будущей защитой idempotency на backend.' },
      ]}
    />
  );
}
