import { Link } from 'react-router-dom';

import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { routes } from '@/lib/routes';
import { getOrderStatusMeta, isCancelledOrder } from '@/lib/status';
import type { OrderListItem } from '@/lib/types';

type OrderCardProps = {
  order: OrderListItem;
};

function MetaTile({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className={['mt-2 text-base font-semibold text-slate-950', emphasized ? 'text-lg tracking-wide' : ''].join(' ')}>
        {value}
      </div>
    </div>
  );
}

export function OrderCard({ order }: OrderCardProps) {
  const orderStatus = getOrderStatusMeta(order.status);
  const isCancelled = isCancelledOrder(order.status);

  return (
    <article className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <StatusBadge tone={orderStatus.tone}>{orderStatus.label}</StatusBadge>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[2rem]">{order.route}</h2>
            <p className="mt-2 text-base text-slate-500">{formatDateTime(order.departureAt)}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[560px]">
          <MetaTile label="Пассажир" value={order.passenger} />
          {isCancelled ? (
            <MetaTile label="Статус" value="ОТМЕНЁН" emphasized />
          ) : (
            <MetaTile label="PNR" value={order.pnr} />
          )}
          <MetaTile label="Стоимость" value={formatCurrency(order.amount, order.currency)} />
        </div>
      </div>

      {!isCancelled ? (
        <div className="mt-6">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand/90"
            to={routes.order(order.id)}
          >
            Открыть заказ
          </Link>
        </div>
      ) : null}
    </article>
  );
}
