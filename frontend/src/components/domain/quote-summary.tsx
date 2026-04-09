import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getOperationStatusMeta } from '@/lib/status';
import type { OperationView } from '@/lib/types';

type QuoteSummaryProps = {
  mode: 'exchange' | 'refund';
  operation: OperationView;
};

export function QuoteSummary({ mode, operation }: QuoteSummaryProps) {
  const operationStatus = getOperationStatusMeta(operation.status);

  return (
    <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-brand/80">
            {mode === 'exchange' ? 'Расчёт обмена' : 'Расчёт возврата'}
          </div>
          <h2 className="text-2xl font-bold text-slate-950">Сводка по бронированию {operation.pnr}</h2>
          <p className="text-base text-slate-600">
            Проверьте итоговую сумму, комиссию и срок действия расчёта перед подтверждением.
          </p>
        </div>
        <StatusBadge tone={operationStatus.tone}>{operationStatus.label}</StatusBadge>
      </div>

      <dl className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-slate-500">
            {mode === 'exchange' ? 'Итоговая сумма' : 'Сумма возврата'}
          </dt>
          <dd className="mt-2 text-2xl font-bold text-slate-950">
            {formatCurrency(operation.quote.amount, operation.quote.currency)}
          </dd>
        </div>
        {mode === 'exchange' ? (
          <>
            <div>
              <dt className="text-sm font-semibold text-slate-500">Сбор за обмен</dt>
              <dd className="mt-2 text-lg font-semibold text-slate-900">
                {formatCurrency(operation.quote.changeFee ?? 0, operation.quote.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">Разница тарифа</dt>
              <dd className="mt-2 text-lg font-semibold text-slate-900">
                {formatCurrency(operation.quote.fareDifference ?? 0, operation.quote.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">Доплата</dt>
              <dd className="mt-2 text-lg font-semibold text-slate-900">
                {operation.quote.requiresPayment
                  ? formatCurrency(operation.quote.amount, operation.quote.currency)
                  : 'Не требуется'}
              </dd>
            </div>
          </>
        ) : (
          <div>
            <dt className="text-sm font-semibold text-slate-500">Комиссия за возврат</dt>
            <dd className="mt-2 text-lg font-semibold text-slate-900">
              {formatCurrency(operation.quote.refundFee ?? 0, operation.quote.currency)}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-sm font-semibold text-slate-500">Срок действия расчёта</dt>
          <dd className="mt-2 text-lg font-semibold text-slate-900">
            {operation.quote.expiresAt ? formatDateTime(operation.quote.expiresAt) : 'Без ограничения'}
          </dd>
        </div>
      </dl>

      {operation.reason ? (
        <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {operation.reason}
        </div>
      ) : null}
    </section>
  );
}
