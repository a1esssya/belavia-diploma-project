import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/app/auth-context';
import { QuoteSummary } from '@/components/domain/quote-summary';
import { AppShell } from '@/components/layout/app-shell';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import { routes } from '@/lib/routes';
import type { OperationView } from '@/lib/types';

function createIdempotencyKey() {
  return `exchange-${crypto.randomUUID()}`;
}

export function ExchangeConfirmPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { orderId = '', operationId = '' } = useParams();
  const [operation, setOperation] = useState<OperationView | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const operationQuery = useAsyncData(
    () => api.getExchangeOperation(accessToken ?? '', operationId),
    [accessToken, operationId],
  );

  const resolvedOperation = operation ?? operationQuery.data ?? null;

  async function handleConfirm() {
    if (!resolvedOperation) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await api.confirmExchange(
        accessToken ?? '',
        orderId,
        resolvedOperation.id,
        createIdempotencyKey(),
      );
      setOperation(response);
    } catch (requestError) {
      setSubmitError(requestError instanceof Error ? requestError.message : 'Не удалось подтвердить обмен');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (operationQuery.isLoading && !resolvedOperation) {
    return (
      <AppShell>
        <section className="rounded-[28px] border border-white/70 bg-white p-8 text-base text-slate-500 shadow-card shadow-slate-900/5">
          Загружаем подтверждение обмена...
        </section>
      </AppShell>
    );
  }

  if ((operationQuery.error && !resolvedOperation) || !resolvedOperation) {
    return (
      <AppShell>
        <ErrorState
          description={operationQuery.error ?? 'Не удалось загрузить расчёт обмена'}
          onRetry={operationQuery.reload}
        />
      </AppShell>
    );
  }

  const isFinal = resolvedOperation.status !== 'QUOTED';

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          backHref={routes.exchange(orderId)}
          backLabel="Назад к расчёту"
          eyebrow={`Подтверждение · ${resolvedOperation.pnr}`}
          title="Подтверждение обмена"
          subtitle="Проверьте сводку операции. После подтверждения изменения будут применены к заказу."
        />

        <QuoteSummary mode="exchange" operation={resolvedOperation} />

        <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
          <h2 className="text-2xl font-bold text-slate-950">Шаг 2. Подтверждение</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Подтвердите обмен, если все данные и итоговая сумма вас устраивают.
          </p>

          {submitError ? (
            <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {submitError}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton disabled={isFinal} isLoading={isSubmitting} onClick={() => void handleConfirm()} type="button">
              Подтвердить
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => navigate(routes.exchange(orderId))}>
              Отменить
            </SecondaryButton>
            {isFinal ? (
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
                to={routes.order(orderId)}
              >
                Вернуться к заказу
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
