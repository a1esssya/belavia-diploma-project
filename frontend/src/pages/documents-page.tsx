import { PlaceholderPage } from './page-factory';

export function DocumentsPage() {
  return (
    <PlaceholderPage
      title="Documents"
      subtitle="Скелет экрана документов с акцентом на понятное повторное отправление документов на email."
      blocks={[
        { title: 'Documents list', description: 'Список доступных документов по заказу с типом и статусом.' },
        { title: 'Resend action', description: 'Secondary CTA для повторной отправки документов.' },
      ]}
    />
  );
}
