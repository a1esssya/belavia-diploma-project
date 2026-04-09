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
import { buildTimelineEvents } from '@/lib/history';
import { routes } from '@/lib/routes';
import { getOperationAvailabilityMeta, getOrderStatusMeta, isCancelledOrder } from '@/lib/status';
import type { AncillaryItem, BaggageLine } from '@/lib/types';

function formatBaggage(line: BaggageLine) {
  return `${line.pieces} место, ${line.weightKg} кг`;
}

function mergeCheckedBaggage(checked: BaggageLine, extraPurchased?: BaggageLine | null): BaggageLine {
  return {
    pieces: checked.pieces + (extraPurchased?.pieces ?? 0),
    weightKg: checked.weightKg + (extraPurchased?.weightKg ?? 0),
  };
}

function getAncillaryTone(type: AncillaryItem['type']) {
  switch (type) {
    case 'SEAT':
      return 'bg-sky-50 text-sky-700';
    case 'MEAL':
      return 'bg-amber-50 text-amber-700';
    case 'EXTRA_BAGGAGE':
      return 'bg-emerald-50 text-emerald-700';
  }
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white/90 p-4 shadow-sm shadow-slate-900/5 ring-1 ring-white">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-base font-semibold text-slate-950">{value}</div>
    </div>
  );
}

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
          Загружаем заказ...
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
  const exchangeStatus = getOperationAvailabilityMeta('exchange', data.status, data.exchange);
  const refundStatus = getOperationAvailabilityMeta('refund', data.status, data.refund);
  const timelineEvents = buildTimelineEvents(data.recentEvents, data.status);
  const isCancelled = isCancelledOrder(data.status);
  const checkedBaggage = mergeCheckedBaggage(data.baggageSummary.checked, data.baggageSummary.extraPurchased);
  const visibleAncillaries = data.ancillaries.filter((item) => item.type !== 'EXTRA_BAGGAGE');
  const exchangeAvailable = !isCancelled && data.exchange.available;
  const refundAvailable = !isCancelled && data.refund.available;
  const bothUnavailable = !exchangeAvailable && !refundAvailable;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          backHref={routes.trips}
          backLabel="Назад к поездкам"
          eyebrow={`PNR ${data.pnr}`}
          subtitle="Карточка заказа с маршрутом, багажом, дополнительными услугами, документами и историей изменений."
          title="Карточка заказа"
        />

        <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-card shadow-slate-900/5">
          <div className="bg-[linear-gradient(135deg,#eef2ff_0%,#f8fafc_48%,#ffffff_100%)] p-6 md:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={orderStatus.tone}>{orderStatus.label}</StatusBadge>
                </div>

                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-brand/75">Маршрут</div>
                  <h2 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                    {data.itinerary.origin} → {data.itinerary.destination}
                  </h2>
                  <p className="mt-3 text-lg text-slate-600">{data.itinerary.route}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:w-[520px]">
                <SummaryTile
                  label="Дата и время"
                  value={formatDateRange(data.itinerary.departureAt, data.itinerary.arrivalAt)}
                />
                <SummaryTile label="Стоимость" value={formatCurrency(data.amount, data.currency)} />
                <SummaryTile label="PNR" value={data.pnr} />
                <SummaryTile label="Номер билета" value={data.ticketNumber} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <section className="rounded-[28px] border border-slate-200 bg-white p-5">
                <h3 className="text-xl font-bold text-slate-950">Пассажир и статус заказа</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-500">Пассажир</div>
                    <div className="mt-2 text-base font-semibold text-slate-950">{data.passenger.fullName}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-500">Статус заказа</div>
                    <div className="mt-2">
                      <StatusBadge tone={orderStatus.tone}>{orderStatus.label}</StatusBadge>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-950">Багаж</h3>
                  {!isCancelled ? (
                    <Link
                      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
                      to={routes.addBaggage(data.id)}
                    >
                      Добавить багаж
                    </Link>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-500">Ручная кладь</div>
                    <div className="mt-2 text-base font-semibold text-slate-950">
                      {formatBaggage(data.baggageSummary.cabin)}
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-500">Багаж</div>
                    <div className="mt-2 text-base font-semibold text-slate-950">
                      {formatBaggage(checkedBaggage)}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-950">Дополнительные услуги</h3>
                  {!isCancelled ? (
                    <Link
                      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
                      to={routes.addServices(data.id)}
                    >
                      Добавить услуги
                    </Link>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-3">
                  {visibleAncillaries.length > 0 ? (
                    visibleAncillaries.map((service) => (
                      <div
                        className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                        key={service.id}
                      >
                        <div>
                          <div className="text-base font-semibold text-slate-950">{service.title}</div>
                          <div className="mt-1 text-sm text-slate-600">{service.description}</div>
                        </div>
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getAncillaryTone(service.type)}`}
                        >
                          {service.type === 'SEAT' ? 'Место' : 'Питание'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      Дополнительные услуги пока не подключены.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section className="rounded-[28px] border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-bold text-slate-950">Быстрые действия</h2>
                <div className="mt-4 grid gap-3">
                  <Link
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
                    to={routes.documents(data.id)}
                  >
                    Документы
                  </Link>
                  <Link
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
                    to={routes.history(data.id)}
                  >
                    История изменений
                  </Link>
                  {exchangeAvailable ? (
                    <Link
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
                      to={routes.exchange(data.id)}
                    >
                      Обмен билета
                    </Link>
                  ) : null}
                  {refundAvailable ? (
                    <Link
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
                      to={routes.refund(data.id)}
                    >
                      Возврат билета
                    </Link>
                  ) : null}
                </div>

                {bothUnavailable ? (
                  <p className="mt-4 text-sm leading-6 text-slate-500">Обмен и возврат недоступны</p>
                ) : (
                  <div className="mt-4 space-y-2 text-sm leading-6 text-slate-500">
                    {!exchangeAvailable ? <p>Обмен недоступен</p> : null}
                    {!refundAvailable ? <p>Возврат недоступен</p> : null}
                  </div>
                )}
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-bold text-slate-950">Последние события</h2>
                <div className="mt-4">
                  {timelineEvents.length > 0 ? (
                    <EventTimeline events={timelineEvents} />
                  ) : (
                    <EmptyState description="Для этого заказа пока нет событий." title="Событий пока нет" />
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
