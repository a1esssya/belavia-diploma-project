import { Link, useParams } from 'react-router-dom';

import { useAuth } from '@/app/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { EventTimeline } from '@/components/domain/event-timeline';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import { formatCurrency, formatDateRange } from '@/lib/format';
import { routes } from '@/lib/routes';
import { getEligibilityMeta, getOrderStatusMeta } from '@/lib/status';

export function OrderPage() {
  const { accessToken } = useAuth();
  const { orderId = '' } = useParams();
  const { data, error, isLoading, reload } = useAsyncData(
    () => api.getOrder(accessToken ?? '', orderId),
    [accessToken, orderId],
  );

  if (isLoading) {
    return (
      <AppShell>
        <section className="rounded-[28px] border border-white/70 bg-white p-8 text-base text-slate-500 shadow-card shadow-slate-900/5">
          Загружаем карточку заказа...
        </section>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <ErrorState description={error ?? 'Заказ не найден'} onRetry={reload} />
      </AppShell>
    );
  }

  const orderStatus = getOrderStatusMeta(data.status);
  const exchangeStatus = getEligibilityMeta(data.exchange);
  const refundStatus = getEligibilityMeta(data.refund);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          backHref={routes.trips}
          backLabel="Назад к поездкам"
          eyebrow={`PNR ${data.pnr}`}
          subtitle="Центральная карточка заказа с маршрутной информацией, документами, историей и доступными post-booking действиями."
          title="Карточка заказа"
        />

        <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={orderStatus.tone}>{orderStatus.label}</StatusBadge>
            <StatusBadge tone={exchangeStatus.tone}>{exchangeStatus.label}</StatusBadge>
            <StatusBadge tone={refundStatus.tone}>{refundStatus.label}</StatusBadge>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] bg-slate-50 p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Маршрут</div>
              <div className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                {data.itinerary.origin} → {data.itinerary.destination}
              </div>
              <div className="mt-2 text-lg text-slate-500">{data.itinerary.route}</div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm font-semibold text-slate-500">Вылет и прилёт</div>
                  <div className="mt-2 text-base font-semibold text-slate-950">
                    {formatDateRange(data.itinerary.departureAt, data.itinerary.arrivalAt)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">Стоимость</div>
                  <div className="mt-2 text-base font-semibold text-slate-950">
                    {formatCurrency(data.amount, data.currency)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">Пассажир</div>
                  <div className="mt-2 text-base font-semibold text-slate-950">{data.passenger.fullName}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500">Номер билета</div>
                  <div className="mt-2 text-base font-semibold text-slate-950">{data.ticketNumber}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <section className="rounded-[28px] border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-bold text-slate-950">Быстрые действия</h2>
                <div className="mt-4 grid gap-3">
                  <Link
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
                    to={routes.documents(data.id)}
                  >
                    Открыть документы
                  </Link>
                  <Link
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
                    to={routes.history(data.id)}
                  >
                    Смотреть историю
                  </Link>
                  <Link
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-brand px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand/90"
                    to={routes.exchange(data.id)}
                  >
                    Exchange quote
                  </Link>
                  <Link
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
                    to={routes.refund(data.id)}
                  >
                    Refund quote
                  </Link>
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-bold text-slate-950">Недавние события</h2>
                <div className="mt-4">
                  {data.recentEvents.length > 0 ? (
                    <EventTimeline events={data.recentEvents} />
                  ) : (
                    <EmptyState
                      description="История событий пока пуста для этого заказа."
                      title="Событий ещё нет"
                    />
                  )}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
