import { FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '@/app/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { TextInput } from '@/components/ui/text-input';
import { api } from '@/lib/api';
import { routes } from '@/lib/routes';
import type { LoginStartResponse } from '@/lib/types';

function validateEmail(email: string) {
  if (!email.trim()) {
    return 'Введите e-mail';
  }

  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    return 'Введите корректный e-mail';
  }

  return null;
}

export function LoginPage() {
  const { signIn, status } = useAuth();
  const [email, setEmail] = useState('demo@belavia.by');
  const [code, setCode] = useState('');
  const [loginStart, setLoginStart] = useState<LoginStartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate replace to={routes.trips} />;
  }

  const emailError = step === 'email' ? validateEmail(email) : null;

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmailError = validateEmail(email);
    if (nextEmailError) {
      setError(nextEmailError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.startLogin(email.trim());
      setLoginStart(response);
      setCode('');
      setStep('code');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось отправить код подтверждения');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!loginStart) {
      setError('Сначала введите e-mail');
      return;
    }

    if (code.trim().length !== 6) {
      setError('Введите 6-значный код подтверждения');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.verifyLogin(loginStart.email, loginStart.loginSessionId, code.trim());
      signIn({
        accessToken: response.accessToken,
        expiresAt: response.expiresAt,
        user: response.user,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось подтвердить вход');
    } finally {
      setIsSubmitting(false);
    }
  }

  const debugCode =
    import.meta.env.DEV && loginStart?.otpDebugCode ? loginStart.otpDebugCode : undefined;

  return (
    <AppShell compact>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-card shadow-slate-900/5 backdrop-blur sm:p-10">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-brand/80">Belavia</div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Личный кабинет пассажира
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
            Управляйте поездками после бронирования: проверяйте статус заказа, открывайте документы,
            смотрите историю изменений и оформляйте обмен или возврат билета.
          </p>

          <ul className="mt-8 space-y-4 text-base text-slate-700">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-brand" />
              В одном месте собраны все заказы, документы и история изменений.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-brand" />
              Доступность обмена и возврата показывается отдельно для каждого заказа.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-brand" />
              Если вход не нужен, можно проверить бронь по номеру бронирования и фамилии пассажира.
            </li>
          </ul>
        </section>

        <section className="rounded-[32px] border border-white/70 bg-white p-8 shadow-card shadow-slate-900/5 sm:p-10">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-brand/80">
            {step === 'email' ? 'Шаг 1' : 'Шаг 2'}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            {step === 'email' ? 'Вход в личный кабинет' : 'Подтвердите вход'}
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {step === 'email'
              ? 'Введите e-mail, указанный при бронировании. Мы отправим код подтверждения.'
              : 'Введите код из письма.'}
          </p>

          {step === 'email' ? (
            <form className="mt-8 space-y-5" onSubmit={(event) => void handleEmailSubmit(event)}>
              <TextInput
                autoComplete="email"
                error={error ?? emailError}
                label="E-mail"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="demo@belavia.by"
                type="email"
                value={email}
              />
              <PrimaryButton fullWidth isLoading={isSubmitting} type="submit">
                Отправить код
              </PrimaryButton>
              <Link
                className="inline-flex text-sm font-semibold text-brand transition hover:text-brand/80"
                to={routes.bookingStatus}
              >
                Проверить бронь без входа
              </Link>
            </form>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={(event) => void handleCodeSubmit(event)}>
              <TextInput disabled label="E-mail" name="login-email" type="email" value={loginStart?.email ?? email} />
              <TextInput
                error={error}
                hint="Код состоит из 6 цифр."
                inputMode="numeric"
                label="Код подтверждения"
                maxLength={6}
                name="code"
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
                value={code}
              />
              {debugCode ? (
                <details className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <summary className="cursor-pointer font-semibold text-slate-700">Для разработчика</summary>
                  <div className="mt-3">Тестовый код: {debugCode}</div>
                </details>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryButton fullWidth isLoading={isSubmitting} type="submit">
                  Войти
                </PrimaryButton>
                <SecondaryButton
                  fullWidth
                  onClick={() => {
                    setStep('email');
                    setError(null);
                    setCode('');
                  }}
                  type="button"
                >
                  Изменить e-mail
                </SecondaryButton>
              </div>
            </form>
          )}
        </section>
      </div>
    </AppShell>
  );
}
