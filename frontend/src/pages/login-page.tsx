import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

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
    return 'Введите email';
  }

  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    return 'Введите корректный email';
  }

  return null;
}

export function LoginPage() {
  const { signIn, status } = useAuth();
  const [email, setEmail] = useState('demo@belavia.by');
  const [otpCode, setOtpCode] = useState('');
  const [loginStart, setLoginStart] = useState<LoginStartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'otp'>('email');
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
      setOtpCode(response.otpDebugCode ?? '');
      setStep('otp');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось начать вход');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!loginStart) {
      setError('Сначала запросите OTP');
      return;
    }

    if (otpCode.trim().length !== 6) {
      setError('Введите 6-значный OTP-код');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.verifyLogin(loginStart.email, loginStart.loginSessionId, otpCode.trim());
      signIn({
        accessToken: response.accessToken,
        expiresAt: response.expiresAt,
        user: response.user,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось подтвердить OTP');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell compact>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-card shadow-slate-900/5 backdrop-blur sm:p-10">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-brand/80">Belavia account</div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Личный кабинет Belavia
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
            Заказы, документы, история событий и post-booking операции в одном цифровом контуре.
          </p>

          <ul className="mt-8 space-y-4 text-base text-slate-700">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-red-500" />
              Прозрачные статусы по заказу и доступности обмена или возврата.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-red-500" />
              Быстрый доступ к документам и повторной отправке на email.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-red-500" />
              Отдельный booking lookup без авторизации для ограниченного просмотра.
            </li>
          </ul>
        </section>

        <section className="rounded-[32px] border border-white/70 bg-white p-8 shadow-card shadow-slate-900/5 sm:p-10">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-brand/80">
            {step === 'email' ? 'Вход по email OTP' : 'Подтверждение OTP'}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            {step === 'email' ? 'Запросить код входа' : 'Подтвердить вход'}
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Для проверки first-wave используйте `demo@belavia.by`. Backend в dev-режиме возвращает `otpDebugCode`.
          </p>

          {step === 'email' ? (
            <form className="mt-8 space-y-5" onSubmit={(event) => void handleEmailSubmit(event)}>
              <TextInput
                autoComplete="email"
                error={error ?? emailError}
                label="Электронная почта"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="demo@belavia.by"
                type="email"
                value={email}
              />
              <PrimaryButton fullWidth isLoading={isSubmitting} type="submit">
                Получить OTP
              </PrimaryButton>
            </form>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={(event) => void handleOtpSubmit(event)}>
              <TextInput
                disabled
                label="Email"
                name="otp-email"
                type="email"
                value={loginStart?.email ?? email}
              />
              <TextInput
                error={error}
                hint={
                  loginStart?.otpDebugCode
                    ? `Debug OTP from backend: ${loginStart.otpDebugCode}`
                    : 'Введите код из email-мока backend'
                }
                inputMode="numeric"
                label="OTP-код"
                maxLength={6}
                name="otp"
                onChange={(event) => setOtpCode(event.target.value)}
                placeholder="123456"
                value={otpCode}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryButton fullWidth isLoading={isSubmitting} type="submit">
                  Войти
                </PrimaryButton>
                <SecondaryButton
                  fullWidth
                  onClick={() => {
                    setStep('email');
                    setError(null);
                    setOtpCode('');
                  }}
                  type="button"
                >
                  Изменить email
                </SecondaryButton>
              </div>
            </form>
          )}
        </section>
      </div>
    </AppShell>
  );
}
