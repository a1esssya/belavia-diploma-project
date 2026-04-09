import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '@/app/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { QuoteSummary } from '@/components/domain/quote-summary';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { SuccessState } from '@/components/ui/success-state';
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { routes } from '@/lib/routes';
import { getOperationAvailabilityMeta, isCancelledOrder } from '@/lib/status';
import type { BlockedOperationResponse, OperationView } from '@/lib/types';

function createIdempotencyKey() {
  return `exchange-${crypto.randomUUID()}`;
}

function isBlockedResponse(value: OperationView | BlockedOperationResponse): value is BlockedOperationResponse {
  return 'eligibility' in value;
}

export function ExchangePage() {
  const { accessToken } = useAuth();
  const { orderId = '' } = useParams();
  const [quoteResult, setQuoteResult] = useState<OperationView | BlockedOperationResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const orderQuery = useAsyncData(() => api.getOrder(accessToken ?? '', orderId), [accessToken, orderId]);

  async function handleCreateQuote() {
    setIsCreatingQuote(true);
    setQuoteError(null);
    setSubmitError(null);

    try {
      const response = await api.createExchangeQuote(accessToken ?? '', orderId);
      setQuoteResult(response);
    } catch (requestError) {
      setQuoteError(requestError instanceof Error ? requestError.message : 'Не удалось получить расчёт обмена');
    } finally {
      setIsCreatingQuote(false);
    }
  }

  async function handleConfirmQuote(operation: OperationView) {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await api.confirmExchange(
        accessToken ?? '',
        orderId,
        operation.id,
        createIdempotencyKey(),
      );
      setQuoteResult(response);
    } catch (requestError) {
      setSubmitError(requestError instanceof Error ? requestError.message : 'Не удалось подтвердить обмен');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (orderQuery.isLoading) {
    return (
      <AppShell>
        <section className="rounded-[28px] border border-white/70 bg-white p-8 text-base text-slate-500 shadow-card shadow-slate-900/5">
          Загружаем данные по обмену...
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

  const order = orderQuery.data;
  const isCancelled = isCancelledOrder(order.status);
  const availability = getOperationAvailabilityMeta('exchange', order.status, order.exchange);
  const resolvedOperation =
    quoteResult && !isBlockedResponse(quoteResult) ? quoteResult : null;

  if (resolvedOperation?.status === 'SUCCEEDED') {
    return (
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            backHref={routes.order(orderId)}
            backLabel="Назад к заказу"
            eyebrow={`Обмен билета · ${order.pnr}`}
            subtitle="Операция завершена. Заказ и история изменений уже обновлены."
            title="Обмен билета"
          />
          <SuccessState
            description="Новый вариант перелёта сохранён в заказе, а подтверждение обмена добавлено к документам."
            primaryHref={routes.order(orderId)}
            primaryLabel="Вернуться в заказ"
            secondaryHref={routes.trips}
            secondaryLabel="К списку заказов"
            title="Обмен подтверждён"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          backHref={routes.order(orderId)}
          backLabel="Назад к заказу"
          eyebrow={`Обмен билета · ${order.pnr}`}
          subtitle="Сначала запросите расчёт, затем подтвердите обмен прямо на этой странице."
          title="Обмен билета"
        />

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-950">Шаг 1. Расчёт</h2>
              <StatusBadge tone={availability.tone}>{availability.label}</StatusBadge>
            </div>

            <dl className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5">
              <div>
                <dt className="text-sm font-semibold text-slate-500">Маршрут</dt>
                <dd className="mt-2 text-base font-semibold text-slate-950">{order.itinerary.route}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-500">Текущая стоимость</dt>
                <dd className="mt-2 text-base font-semibold text-slate-950">
                  {formatCurrency(order.amount, order.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-500">Комментарий</dt>
                <dd className="mt-2 text-base text-slate-700">
                  {availability.reason ?? 'Запросите расчёт, чтобы увидеть итоговую сумму, доплату и срок действия предложения.'}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <PrimaryButton
                disabled={isCancelled}
                fullWidth
                isLoading={isCreatingQuote}
                onClick={() => void handleCreateQuote()}
                type="button"
              >
                Рассчитать обмен
              </PrimaryButton>
            </div>

            {quoteError ? (
              <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {quoteError}
              </div>
            ) : null}
          </section>

          {isCancelled ? (
            <ErrorState title="Обмен недоступен" description="Обмен недоступен, потому что заказ отменён." />
          ) : quoteResult ? (
            isBlockedResponse(quoteResult) ? (
              <ErrorState
                description={quoteResult.eligibility.reason ?? 'Обмен недоступен для этого заказа'}
                title="Обмен недоступен"
              />
            ) : (
              <div className="space-y-4">
                <QuoteSummary mode="exchange" operation={quoteResult} />
                {submitError ? (
                  <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {submitError}
                  </div>
                ) : null}
                <PrimaryButton
                  fullWidth
                  isLoading={isSubmitting}
                  onClick={() => void handleConfirmQuote(quoteResult)}
                  type="button"
                >
                  Подтвердить обмен
                </PrimaryButton>
              </div>
            )
          ) : (
            <EmptyState
              description="После расчёта здесь появится сводка по обмену с итоговой суммой, доплатой и сроком действия."
              title="Расчёт ещё не запрошен"
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
