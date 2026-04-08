import { FormEvent, useState } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextInput } from '@/components/ui/text-input';
import { api } from '@/lib/api';
import { formatDateRange } from '@/lib/format';
import { getEligibilityMeta, getOrderStatusMeta } from '@/lib/status';
import type { BookingLookupResult } from '@/lib/types';

export function BookingStatusPage() {
  const [pnr, setPnr] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [passengerLastName, setPassengerLastName] = useState('');
  const [result, setResult] = useState<BookingLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passengerLastName.trim()) {
      setError('Введите фамилию пассажира');
      return;
    }

    if (!pnr.trim() && !ticketNumber.trim()) {
      setError('Укажите PNR или номер билета');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.lookupBooking({
        pnr: pnr.trim() || undefined,
        ticketNumber: ticketNumber.trim() || undefined,
        passengerLastName: passengerLastName.trim(),
      });

      setResult(response);
    } catch (requestError) {
      setResult(null);
      setError(requestError instanceof Error ? requestError.message : 'Не удалось найти бронирование');
    } finally {
      setIsSubmitting(false);
    }
  }

  const orderStatus = result ? getOrderStatusMeta(result.status) : null;
  const exchangeStatus = result ? getEligibilityMeta(result.exchange) : null;
  const refundStatus = result ? getEligibilityMeta(result.refund) : null;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Booking lookup"
          subtitle="Ограниченный просмотр бронирования по PNR или номеру билета и фамилии без входа в личный кабинет."
          title="Проверить статус брони"
        />

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
            <h2 className="text-2xl font-bold text-slate-950">Форма поиска</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Достаточно заполнить фамилию и один из идентификаторов брони.
            </p>
            <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              <TextInput
                label="PNR"
                onChange={(event) => setPnr(event.target.value.toUpperCase())}
                placeholder="Например, 97BNT5"
                value={pnr}
              />
              <TextInput
                label="Номер билета"
                onChange={(event) => setTicketNumber(event.target.value)}
                placeholder="6281234567890"
                value={ticketNumber}
              />
              <TextInput
                error={error}
                label="Фамилия пассажира"
                onChange={(event) => setPassengerLastName(event.target.value)}
                placeholder="Dubik"
                value={passengerLastName}
              />
              <PrimaryButton fullWidth isLoading={isSubmitting} type="submit">
                Найти бронирование
              </PrimaryButton>
            </form>
          </section>

          {error && !result ? (
            <ErrorState description={error} />
          ) : result && orderStatus && exchangeStatus && refundStatus ? (
            <section className="rounded-[28px] border border-white/70 bg-white p-6 shadow-card shadow-slate-900/5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={orderStatus.tone}>{orderStatus.label}</StatusBadge>
                <StatusBadge tone={exchangeStatus.tone}>{exchangeStatus.label}</StatusBadge>
                <StatusBadge tone={refundStatus.tone}>{refundStatus.label}</StatusBadge>
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{result.route}</h2>
              <p className="mt-2 text-base text-slate-500">{`PNR ${result.pnr} · Фамилия ${result.passengerLastName}`}</p>

              <dl className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Вылет и прилёт</dt>
                  <dd className="mt-2 text-base font-semibold text-slate-950">
                    {formatDateRange(result.departureAt, result.arrivalAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Доступность обмена</dt>
                  <dd className="mt-2 text-base font-semibold text-slate-950">{exchangeStatus.label}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Доступность возврата</dt>
                  <dd className="mt-2 text-base font-semibold text-slate-950">{refundStatus.label}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Ограничение</dt>
                  <dd className="mt-2 text-base font-semibold text-slate-950">
                    Только просмотр статуса без доступа к документам и истории.
                  </dd>
                </div>
              </dl>
            </section>
          ) : (
            <EmptyState
              description="После поиска здесь появится ограниченная карточка бронирования с базовыми статусами и доступностью exchange/refund."
              title="Результат пока не загружен"
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
