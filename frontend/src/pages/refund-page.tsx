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
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { routes } from '@/lib/routes';
import { getEligibilityMeta } from '@/lib/status';
import type { BlockedOperationResponse, OperationView } from '@/lib/types';

function isBlockedResponse(
  value: OperationView | BlockedOperationResponse,
): value is BlockedOperationResponse {
  return 'eligibility' in value;
}

export function RefundPage() {
  const { accessToken } = useAuth();
  const { orderId = '' } = useParams();
  const [quoteResult, setQuoteResult] = useState<OperationView | BlockedOperationResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const orderQuery = useAsyncData(() => api.getOrder(accessToken ?? '', orderId), [accessToken, orderId]);

  async function handleCreateQuote() {
    setIsCreatingQuote(true);
    setQuoteError(null);

    try {
      const response = await api.createRefundQuote(accessToken ?? '', orderId);
      setQuoteResult(response);
    } catch (requestError) {
      setQuoteError(requestError instanceof Error ? requestError.message : 'Не удалось получить refund quote');
    } finally {
      setIsCreatingQuote(false);
    }
  }

  if (orderQuery.isLoading) {
    return (
      <AppShell>
        <section className="rounded-[28px] border border-white/70 bg-white p-8 text-base text-slate-500 shadow-card shadow-slate-900/5">
          Загружаем refund flow...
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

  const eligibility = getEligibilityMeta(orderQuery.data.refund);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          backHref={routes.order(orderId)}
          backLabel="Назад к заказу"
          eyebrow={`Refund · ${orderQuery.data.pnr}`}
          subtitle="Рабочий refund quote-flow первой очереди с прямой связкой с backend API и реальными статусами."
          title="Возврат билета"
        />

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-950">Параметры операции</h2>
              <StatusBadge tone={eligibility.tone}>{eligibility.label}</StatusBadge>
            </div>

            <dl className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5">
              <div>
                <dt className="text-sm font-semibold text-slate-500">Маршрут</dt>
                <dd className="mt-2 text-base font-semibold text-slate-950">{orderQuery.data.itinerary.route}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-500">Оплачено</dt>
                <dd className="mt-2 text-base font-semibold text-slate-950">
                  {formatCurrency(orderQuery.data.amount, orderQuery.data.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-slate-500">Комментарий</dt>
                <dd className="mt-2 text-base text-slate-700">
                  Страница уже покрывает реальный quote-flow. Финальное UX-подтверждение confirm можно добавить следующим шагом.
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <PrimaryButton fullWidth isLoading={isCreatingQuote} onClick={() => void handleCreateQuote()} type="button">
                Запросить refund quote
              </PrimaryButton>
            </div>

            {quoteError ? (
              <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {quoteError}
              </div>
            ) : null}
          </section>

          {quoteResult ? (
            isBlockedResponse(quoteResult) ? (
              <ErrorState
                description={quoteResult.eligibility.reason ?? 'Возврат недоступен для этого заказа'}
                title="Refund недоступен"
              />
            ) : (
              <QuoteSummary mode="refund" operation={quoteResult} />
            )
          ) : (
            <EmptyState
              description="После запроса backend вернёт реальный расчёт возврата или причину блокировки. Этот шаг уже полностью подключён к API."
              title="Quote ещё не запрошен"
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
