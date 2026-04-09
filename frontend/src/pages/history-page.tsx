import { useParams } from 'react-router-dom';

import { useAuth } from '@/app/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { EventTimeline } from '@/components/domain/event-timeline';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import { buildTimelineEvents } from '@/lib/history';
import { routes } from '@/lib/routes';

export function HistoryPage() {
  const { accessToken } = useAuth();
  const { orderId = '' } = useParams();
  const orderQuery = useAsyncData(() => api.getOrder(accessToken ?? '', orderId), [accessToken, orderId]);
  const historyQuery = useAsyncData(() => api.getHistory(accessToken ?? '', orderId), [accessToken, orderId]);

  if (orderQuery.isLoading || historyQuery.isLoading) {
    return (
      <AppShell>
        <section className="rounded-[28px] border border-white/70 bg-white p-8 text-base text-slate-500 shadow-card shadow-slate-900/5">
          Загружаем историю...
        </section>
      </AppShell>
    );
  }

  if (orderQuery.error || historyQuery.error || !orderQuery.data) {
    return (
      <AppShell>
        <ErrorState
          description={orderQuery.error ?? historyQuery.error ?? 'Не удалось загрузить историю'}
          onRetry={() => {
            orderQuery.reload();
            historyQuery.reload();
          }}
        />
      </AppShell>
    );
  }

  const events = buildTimelineEvents(historyQuery.data ?? [], orderQuery.data.status);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          backHref={routes.order(orderId)}
          backLabel="Назад к заказу"
          eyebrow={`История · ${orderQuery.data.pnr}`}
          subtitle="Короткая история изменений по заказу без технических кодов и повторяющихся записей."
          title="История изменений"
        />

        <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
          {events.length > 0 ? (
            <EventTimeline events={events} />
          ) : (
            <EmptyState description="События по этому заказу ещё не появились." title="История пока пуста" />
          )}
        </section>
      </div>
    </AppShell>
  );
}
