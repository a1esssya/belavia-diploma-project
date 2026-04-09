import type { OrderEvent, OrderStatus } from '@/lib/types';

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

function getEventPresentation(event: OrderEvent): { title: string; description: string; dedupeKey: string } {
  switch (event.type) {
    case 'order.seeded':
      return {
        title: 'Заказ добавлен в личный кабинет',
        description: 'Бронирование появилось в списке поездок.',
        dedupeKey: 'order.seeded',
      };
    case 'documents.sent':
      return {
        title: 'Документы отправлены',
        description: 'Документы были отправлены на e-mail, указанный при бронировании.',
        dedupeKey: 'documents.sent',
      };
    case 'documents.resent':
      return {
        title: 'Документы отправлены повторно',
        description: 'Документы повторно отправлены на e-mail пассажира.',
        dedupeKey: 'documents.resent',
      };
    case 'exchange.available':
      return {
        title: 'Обмен доступен',
        description: 'Для этого заказа можно запросить расчёт обмена.',
        dedupeKey: 'exchange.available',
      };
    case 'exchange.confirmed':
      return {
        title: 'Обмен билета подтверждён',
        description: 'Изменения по билету успешно применены.',
        dedupeKey: 'exchange.confirmed',
      };
    case 'exchange.failed':
      return {
        title: 'Не удалось подтвердить обмен',
        description: event.message,
        dedupeKey: `exchange.failed:${event.message}`,
      };
    case 'exchange.expired':
      return {
        title: 'Срок действия расчёта обмена истёк',
        description: 'Для продолжения обмена потребуется новый расчёт.',
        dedupeKey: 'exchange.expired',
      };
    case 'refund.confirmed':
      return {
        title: 'Возврат билета подтверждён',
        description: 'Заказ был переведён в отменённый статус.',
        dedupeKey: 'refund.confirmed',
      };
    case 'refund.failed':
      return {
        title: 'Не удалось подтвердить возврат',
        description: event.message,
        dedupeKey: `refund.failed:${event.message}`,
      };
    case 'refund.expired':
      return {
        title: 'Срок действия расчёта возврата истёк',
        description: 'Для продолжения возврата потребуется новый расчёт.',
        dedupeKey: 'refund.expired',
      };
    case 'baggage.added':
      return {
        title: 'Багаж добавлен',
        description: event.message,
        dedupeKey: `baggage.added:${event.message}`,
      };
    case 'ancillary.seat.added':
      return {
        title: 'Услуга выбора места добавлена',
        description: event.message,
        dedupeKey: `ancillary.seat.added:${event.message}`,
      };
    case 'ancillary.meal.added':
      return {
        title: 'Питание добавлено',
        description: event.message,
        dedupeKey: `ancillary.meal.added:${event.message}`,
      };
    case 'order.cancelled':
      return {
        title: 'Заказ отменён',
        description: 'Заказ переведён в отменённый статус.',
        dedupeKey: 'order.cancelled',
      };
    default:
      return {
        title: 'Изменение по заказу',
        description: event.message,
        dedupeKey: `${event.type}:${event.message}`,
      };
  }
}

export function buildTimelineEvents(events: OrderEvent[], orderStatus: OrderStatus): TimelineEvent[] {
  const seen = new Set<string>();

  return events.reduce<TimelineEvent[]>((acc, event) => {
    if (
      orderStatus === 'CANCELLED' &&
      (event.type === 'exchange.blocked' || event.type === 'refund.blocked')
    ) {
      return acc;
    }

    const presentation = getEventPresentation(event);

    if (seen.has(presentation.dedupeKey)) {
      return acc;
    }

    seen.add(presentation.dedupeKey);
    acc.push({
      id: event.id,
      title: presentation.title,
      description: presentation.description,
      createdAt: event.createdAt,
    });

    return acc;
  }, []);
}
