import { PlaceholderPage } from './page-factory';

export function HistoryPage() {
  return (
    <PlaceholderPage
      title="Order history"
      subtitle="Линейная структура событий заказа: подготовка для будущих данных из backend."
      blocks={[
        { title: 'Timeline', description: 'События с датой, типом и кратким описанием изменения заказа.' },
      ]}
    />
  );
}
