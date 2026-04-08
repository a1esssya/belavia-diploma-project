import { PlaceholderPage } from './page-factory';

export function LoginPage() {
  return (
    <PlaceholderPage
      title="Login via OTP"
      subtitle="Mobile-first экран авторизации, подготовленный для потока email OTP без финальной бизнес-логики."
      blocks={[
        { title: 'Email input', description: 'Поле ввода email и primary CTA для старта OTP с чистой системой отступов.' },
        { title: 'OTP confirmation', description: 'Блок подтверждения кода и обработка базовых UI-состояний формы.' },
      ]}
    />
  );
}
