import { Link } from 'react-router-dom';

import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { routes } from '@/lib/routes';
import { getOrderStatusMeta, isCancelledOrder } from '@/lib/status';
import type { OrderListItem } from '@/lib/types';

type OrderCardProps = {
  order: OrderListItem;
};

export function OrderCard({ order }: OrderCardProps) {
  const orderStatus = getOrderStatusMeta(order.status);
  const isCancelled = isCancelledOrder(order.status);

  if (isCancelled) {
    return (
      <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-card shadow-slate-900/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <StatusBadge tone={orderStatus.tone}>{orderStatus.label}</StatusBadge>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[2rem]">{order.route}</h2>
              <p className="mt-2 text-base text-slate-500">{formatDateTime(order.departureAt)}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-[180px] rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Пассажир</div>
              <div className="mt-2 text-base font-semibold text-slate-950">{order.passenger}</div>
            </div>
            <div className="min-w-[180px] rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Стоимость</div>
              <div className="mt-2 text-base font-semibold text-slate-950">
                {formatCurrency(order.amount, order.currency)}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <StatusBadge tone={orderStatus.tone}>{orderStatus.label}</StatusBadge>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[2rem]">{order.route}</h2>
            <p className="mt-2 text-base text-slate-500">{formatDateTime(order.departureAt)}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[560px]">
          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-500">Пассажир</div>
            <div className="mt-2 text-base font-semibold text-slate-950">{order.passenger}</div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-500">PNR</div>
            <div className="mt-2 text-base font-semibold text-slate-950">{order.pnr}</div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-500">Стоимость</div>
            <div className="mt-2 text-base font-semibold text-slate-950">
              {formatCurrency(order.amount, order.currency)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand/90"
          to={routes.order(order.id)}
        >
          Открыть заказ
        </Link>
      </div>
    </article>
  );
}
