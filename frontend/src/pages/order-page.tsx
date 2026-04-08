import { PlaceholderPage } from './page-factory';

export function OrderPage() {
  return (
    <PlaceholderPage
      title="Order card"
      subtitle="Центральный экран личного кабинета с блоками для маршрута, документов, истории и post-booking действий."
      blocks={[
        { title: 'Order summary', description: 'Маршрут, статус, пассажир и ключевые данные заказа.' },
        { title: 'Available actions', description: 'Ссылки на документы, историю, exchange и refund.' },
      ]}
    />
  );
}
