import { Link } from 'react-router-dom';

import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatDateTime, formatRelativeDeparture } from '@/lib/format';
import { routes } from '@/lib/routes';
import { getEligibilityMeta, getOrderStatusMeta } from '@/lib/status';
import type { OrderListItem } from '@/lib/types';

type OrderCardProps = {
  order: OrderListItem;
};

export function OrderCard({ order }: OrderCardProps) {
  const orderStatus = getOrderStatusMeta(order.status);
  const exchangeStatus = getEligibilityMeta(order.exchange);
  const refundStatus = getEligibilityMeta(order.refund);

  return (
    <article className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="brand">{formatRelativeDeparture(order.departureAt)}</StatusBadge>
            <StatusBadge tone={orderStatus.tone}>{orderStatus.label}</StatusBadge>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{order.route}</h2>
            <p className="text-base text-slate-500">{`${order.origin} - ${order.destination}`}</p>
          </div>
        </div>

        <dl className="grid gap-5 sm:grid-cols-2 xl:min-w-[540px] xl:grid-cols-3">
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">Дата и время</dt>
            <dd className="mt-2 text-base text-slate-900">{formatDateTime(order.departureAt)}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">Пассажир</dt>
            <dd className="mt-2 text-base text-slate-900">{order.passenger}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">PNR</dt>
            <dd className="mt-2 text-base text-slate-900">{order.pnr}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">Стоимость</dt>
            <dd className="mt-2 text-base text-slate-900">{formatCurrency(order.amount, order.currency)}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">Обмен</dt>
            <dd className="mt-2">
              <StatusBadge tone={exchangeStatus.tone}>{exchangeStatus.label}</StatusBadge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">Возврат</dt>
            <dd className="mt-2">
              <StatusBadge tone={refundStatus.tone}>{refundStatus.label}</StatusBadge>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
          to={routes.documents(order.id)}
        >
          Документы
        </Link>
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
