import { PlaceholderPage } from './page-factory';

export function TripsPage() {
  return (
    <PlaceholderPage
      title="Trips list"
      subtitle="Каркас страницы со списком заказов: композиция иерархии сохранена, детали будут подключены к API позже."
      blocks={[
        { title: 'Filters and tabs', description: 'Зона фильтрации заказов по статусам upcoming, past и cancelled.' },
        { title: 'Order cards', description: 'Карточки заказов со статусом, пассажиром и краткой маршрутной информацией.' },
      ]}
    />
  );
}
