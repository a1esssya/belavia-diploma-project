import type { Eligibility, OperationStatus, OrderStatus } from '@/lib/types';

export type StatusTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

export type StatusMeta = {
  label: string;
  tone: StatusTone;
};

export function getOrderStatusMeta(status: OrderStatus): StatusMeta {
  switch (status) {
    case 'UPCOMING':
      return { label: 'Предстоящий', tone: 'brand' };
    case 'PAST':
      return { label: 'Завершён', tone: 'neutral' };
    case 'CANCELLED':
      return { label: 'Отменён', tone: 'danger' };
  }
}

export function getOperationStatusMeta(status: OperationStatus): StatusMeta {
  switch (status) {
    case 'QUOTED':
      return { label: 'Quote готов', tone: 'brand' };
    case 'PROCESSING':
      return { label: 'В обработке', tone: 'warning' };
    case 'SUCCEEDED':
      return { label: 'Успешно', tone: 'success' };
    case 'FAILED':
      return { label: 'Ошибка', tone: 'danger' };
    case 'EXPIRED':
      return { label: 'Quote истёк', tone: 'warning' };
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
