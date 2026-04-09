import type { Eligibility, OperationStatus, OrderStatus } from '@/lib/types';

export type StatusTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

export type StatusMeta = {
  label: string;
  tone: StatusTone;
};

export type AvailabilityMeta = {
  label: string;
  tone: StatusTone;
  reason?: string;
};

export function getOrderStatusMeta(status: OrderStatus): StatusMeta {
  switch (status) {
    case 'UPCOMING':
      return { label: 'Предстоящий', tone: 'brand' };
    case 'PAST':
      return { label: 'Завершённый', tone: 'neutral' };
    case 'CANCELLED':
      return { label: 'Отменён', tone: 'danger' };
  }
}

export function getOperationStatusMeta(status: OperationStatus): StatusMeta {
  switch (status) {
    case 'QUOTED':
      return { label: 'Расчёт готов', tone: 'brand' };
    case 'PROCESSING':
      return { label: 'В обработке', tone: 'warning' };
    case 'SUCCEEDED':
      return { label: 'Выполнено', tone: 'success' };
    case 'FAILED':
      return { label: 'Ошибка', tone: 'danger' };
    case 'EXPIRED':
      return { label: 'Срок расчёта истёк', tone: 'warning' };
    case 'BLOCKED':
      return { label: 'Недоступно', tone: 'danger' };
  }
}

export function getEligibilityMeta(eligibility: Eligibility): StatusMeta {
  if (eligibility.available) {
    return {
      label: eligibility.requiresPayment ? 'Доступно с доплатой' : 'Доступно',
      tone: eligibility.requiresPayment ? 'warning' : 'success',
    };
  }

  return {
    label: eligibility.reason ?? 'Недоступно',
    tone: 'danger',
  };
}

export function isCancelledOrder(status: OrderStatus) {
  return status === 'CANCELLED';
}

export function getOperationAvailabilityMeta(
  kind: 'exchange' | 'refund',
  status: OrderStatus,
  eligibility: Eligibility,
): AvailabilityMeta {
  if (status === 'CANCELLED') {
    return {
      label: kind === 'exchange' ? 'Обмен недоступен' : 'Возврат недоступен',
      tone: 'neutral',
      reason:
        kind === 'exchange'
          ? 'Обмен недоступен, потому что заказ отменён.'
          : 'Возврат недоступен, потому что заказ отменён.',
    };
  }

  if (eligibility.available) {
    if (kind === 'exchange' && eligibility.requiresPayment) {
      return {
        label: 'Обмен с доплатой',
        tone: 'warning',
      };
    }

    return {
      label: kind === 'exchange' ? 'Обмен доступен' : 'Возврат доступен',
      tone: 'success',
    };
  }

  return {
    label: kind === 'exchange' ? 'Обмен недоступен' : 'Возврат недоступен',
    tone: 'neutral',
    reason: eligibility.reason,
  };
}
