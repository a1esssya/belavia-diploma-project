import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '@/app/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import { formatDate, formatDateRange, toSentenceCase } from '@/lib/format';
import { routes } from '@/lib/routes';

export function DocumentPreviewPage() {
  const { accessToken } = useAuth();
  const { orderId = '', documentId = '' } = useParams();
  const orderQuery = useAsyncData(() => api.getOrder(accessToken ?? '', orderId), [accessToken, orderId]);

  const document = useMemo(
    () => orderQuery.data?.documents.find((item) => item.id === documentId) ?? null,
    [documentId, orderQuery.data?.documents],
  );

  if (orderQuery.isLoading) {
    return (
      <AppShell>
        <section className="rounded-[28px] border border-white/70 bg-white p-8 text-base text-slate-500 shadow-card shadow-slate-900/5">
          Загружаем документ...
        </section>
      </AppShell>
    );
  }

  if (orderQuery.error || !orderQuery.data) {
    return (
      <AppShell>
        <ErrorState description={orderQuery.error ?? 'Не удалось загрузить документ'} onRetry={orderQuery.reload} />
      </AppShell>
    );
  }

  if (!document) {
    return (
      <AppShell>
        <EmptyState
          title="Документ не найден"
          description="Для этого заказа не удалось найти выбранный документ."
        />
      </AppShell>
    );
  }

  const order = orderQuery.data;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          backHref={routes.documents(orderId)}
          backLabel="Назад к документам"
          eyebrow={`Документ · ${order.pnr}`}
          title={document.title}
          subtitle="Локальный preview документа для демонстрации first-wave сценария без внешних mock-ссылок."
        />

        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-card shadow-slate-900/5">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-brand/80">Belavia</div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{document.title}</h2>
              <p className="mt-2 text-base text-slate-600">
                {toSentenceCase(document.type.replace(/_/g, ' '))}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <div>Номер бронирования</div>
              <div className="mt-1 text-xl font-semibold text-slate-950">{order.pnr}</div>
            </div>
          </div>

          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <dt className="text-sm font-semibold text-slate-500">Пассажир</dt>
              <dd className="mt-2 text-lg font-semibold text-slate-950">{order.passenger.fullName}</dd>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <dt className="text-sm font-semibold text-slate-500">Маршрут</dt>
              <dd className="mt-2 text-lg font-semibold text-slate-950">{order.itinerary.route}</dd>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <dt className="text-sm font-semibold text-slate-500">Дата поездки</dt>
              <dd className="mt-2 text-base font-semibold text-slate-950">
                {formatDateRange(order.itinerary.departureAt, order.itinerary.arrivalAt)}
              </dd>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <dt className="text-sm font-semibold text-slate-500">Тип документа</dt>
              <dd className="mt-2 text-base font-semibold text-slate-950">{document.title}</dd>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <dt className="text-sm font-semibold text-slate-500">Файл</dt>
              <dd className="mt-2 text-base font-semibold text-slate-950">{document.fileName}</dd>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <dt className="text-sm font-semibold text-slate-500">Дата формирования</dt>
              <dd className="mt-2 text-base font-semibold text-slate-950">
                {formatDate(document.lastSentAt ?? order.itinerary.departureAt)}
              </dd>
            </div>
          </dl>

          <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm font-semibold text-slate-500">PNR</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{order.pnr}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500">Номер билета</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{order.ticketNumber}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500">Пассажир</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{order.passenger.fullName}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500">Маршрут</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">
                  {order.itinerary.origin} → {order.itinerary.destination}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
