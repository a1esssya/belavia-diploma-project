import { PlaceholderPage } from './page-factory';

export function BookingStatusPage() {
  return (
    <PlaceholderPage
      title="Booking status lookup"
      subtitle="Ограниченный неавторизованный доступ по PNR/билету и фамилии (только каркас экрана)."
      blocks={[
        { title: 'Lookup form', description: 'Поля PNR/номер билета и фамилия с primary CTA для поиска.' },
        { title: 'Limited result', description: 'Ограниченный просмотр бронирования без доступа к полному личному кабинету.' },
      ]}
    />
  );
}
