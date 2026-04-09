import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/app/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import { routes } from '@/lib/routes';
import type { BaggageLine } from '@/lib/types';

const baggageOptions = [
  {
    id: 'bag-extra-23',
    title: 'Добавить багаж 23 кг',
    description: '1 место зарегистрированного багажа',
  },
  {
    id: 'bag-extra-32',
    title: 'Добавить багаж 32 кг',
    description: '1 место увеличенного багажа',
  },
];

function formatBaggage(line: BaggageLine) {
  return `${line.pieces} место, ${line.weightKg} кг`;
}

export function AddBaggagePage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { orderId = '' } = useParams();
  const [selectedOption, setSelectedOption] = useState(baggageOptions[0].id);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const orderQuery = useAsyncData(() => api.getOrder(accessToken ?? '', orderId), [accessToken, orderId]);

  async function handleSubmit() {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await api.addBaggage(accessToken ?? '', orderId, selectedOption);
      navigate(routes.order(orderId));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось добавить багаж');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (orderQuery.isLoading) {
    return (
      <AppShell>
        <section className="rounded-[28px] border border-white/70 bg-white p-8 text-base text-slate-500 shadow-card shadow-slate-900/5">
          Загружаем данные по багажу...
        </section>
      </AppShell>
    );
  }

  if (orderQuery.error || !orderQuery.data) {
    return (
      <AppShell>
        <ErrorState description={orderQuery.error ?? 'Не удалось загрузить заказ'} onRetry={orderQuery.reload} />
      </AppShell>
    );
  }

  const { baggageSummary, pnr, status } = orderQuery.data;

  if (status === 'CANCELLED') {
    return (
      <AppShell>
        <ErrorState title="Багаж недоступен" description="Для отменённого заказа нельзя добавить багаж." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          backHref={routes.order(orderId)}
          backLabel="Назад к заказу"
          eyebrow={`Багаж · ${pnr}`}
          subtitle="Выберите простой mock-вариант багажа и подтвердите изменение."
          title="Добавить багаж"
        />

        <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
          <h2 className="text-xl font-bold text-slate-950">Текущая норма багажа</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Ручная кладь</div>
              <div className="mt-2 text-base font-semibold text-slate-950">{formatBaggage(baggageSummary.cabin)}</div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Багаж</div>
              <div className="mt-2 text-base font-semibold text-slate-950">{formatBaggage(baggageSummary.checked)}</div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Уже добавлено</div>
              <div className="mt-2 text-base font-semibold text-slate-950">
                {baggageSummary.extraPurchased ? formatBaggage(baggageSummary.extraPurchased) : 'Пока не добавлено'}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
          <h2 className="text-xl font-bold text-slate-950">Выберите вариант</h2>
          <div className="mt-4 grid gap-3">
            {baggageOptions.map((option) => (
              <label
                className={[
                  'flex cursor-pointer items-start gap-4 rounded-3xl border p-4 transition',
                  selectedOption === option.id
                    ? 'border-brand bg-brand/5'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300',
                ].join(' ')}
                key={option.id}
              >
                <input
                  checked={selectedOption === option.id}
                  className="mt-1 h-4 w-4 accent-brand"
                  name="baggage-option"
                  onChange={() => setSelectedOption(option.id)}
                  type="radio"
                />
                <div>
                  <div className="text-base font-semibold text-slate-950">{option.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{option.description}</div>
                </div>
              </label>
            ))}
          </div>

          {submitError ? (
            <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {submitError}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton isLoading={isSubmitting} onClick={() => void handleSubmit()} type="button">
              Подтвердить выбор
            </PrimaryButton>
            <SecondaryButton onClick={() => navigate(routes.order(orderId))} type="button">
              Отменить
            </SecondaryButton>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
