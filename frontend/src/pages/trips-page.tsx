import { useMemo, useState } from 'react';

import { useAuth } from '@/app/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { OrderCard } from '@/components/domain/order-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import type { OrderListItem, OrderStatus } from '@/lib/types';

type TripsFilter = 'ALL' | OrderStatus;

const tabs: Array<{ key: TripsFilter; label: string }> = [
  { key: 'ALL', label: 'Все поездки' },
  { key: 'UPCOMING', label: 'Предстоящие' },
  { key: 'PAST', label: 'Завершённые' },
  { key: 'CANCELLED', label: 'Отменённые' },
];

export function TripsPage() {
  const { accessToken } = useAuth();
  const [activeFilter, setActiveFilter] = useState<TripsFilter>('ALL');
  const [searchValue, setSearchValue] = useState('');
  const { data, error, isLoading, reload } = useAsyncData(
    () => api.getOrders(accessToken ?? ''),
    [accessToken],
  );

  const orders = data ?? [];

  const filteredOrders = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter = activeFilter === 'ALL' ? true : order.status === activeFilter;
      const matchesSearch =
        !search ||
        [order.route, order.origin, order.destination, order.pnr, order.passenger, order.ticketNumber]
          .join(' ')
          .toLowerCase()
          .includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, orders, searchValue]);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Мои поездки"
          subtitle="Предстоящие, завершённые и отменённые заказы. Внутри карточки заказа доступны детали по обмену, возврату, багажу и услугам."
          title="Список заказов"
        />

        <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-card shadow-slate-900/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  className={[
                    'rounded-2xl px-4 py-3 text-sm font-semibold transition',
                    activeFilter === tab.key
                      ? 'bg-brand text-white shadow-md shadow-brand/20'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                  ].join(' ')}
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <input
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 lg:max-w-md"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Поиск по PNR, маршруту или пассажиру"
              value={searchValue}
            />
          </div>
        </section>

        {isLoading ? (
          <section className="rounded-[28px] border border-white/70 bg-white p-8 text-base text-slate-500 shadow-card shadow-slate-900/5">
            Загружаем заказы...
          </section>
        ) : error ? (
          <ErrorState description={error} onRetry={reload} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            description="Для выбранного фильтра ничего не найдено. Попробуйте изменить статус или поисковый запрос."
            title="Заказы не найдены"
          />
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order: OrderListItem) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
