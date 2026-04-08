const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return dateFormatter.format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return dateTimeFormatter.format(new Date(date));
}

export function formatDateRange(start: string | Date, end?: string | Date | null) {
  const formattedStart = formatDateTime(start);

  if (!end) {
    return formattedStart;
  }

  return `${formattedStart} - ${formatDateTime(end)}`;
}

export function formatRelativeDeparture(date: string | Date) {
  const target = new Date(date);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    return 'поездка завершена';
  }

  if (diffDays === 0) {
    return 'вылет сегодня';
  }

  if (diffDays === 1) {
    return 'через 1 день';
  }

  return `через ${diffDays} дн.`;
}

export function toSentenceCase(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
