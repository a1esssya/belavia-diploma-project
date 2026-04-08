import { PlaceholderPage } from './page-factory';

export function RefundPage() {
  return (
    <PlaceholderPage
      title="Refund"
      subtitle="Пошаговый каркас refund-потока с отделённым блоком расчёта и подтверждения операции."
      blocks={[
        { title: 'Eligibility check', description: 'Проверка доступности возврата перед quote.' },
        { title: 'Quote preview', description: 'Расчёт суммы возврата до подтверждения.' },
        { title: 'Confirm operation', description: 'Блок подтверждения refund без реализации бизнес-логики на фронтенде.' },
      ]}
    />
  );
}
