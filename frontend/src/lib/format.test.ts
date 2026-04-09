import { describe, expect, it } from 'vitest';

import { formatCurrency, formatRelativeDeparture } from '@/lib/format';

describe('format utilities', () => {
  it('formats currency in ru-RU style', () => {
    expect(formatCurrency(120, 'EUR')).toContain('120');
  });

  it('returns a future departure label', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(formatRelativeDeparture(tomorrow)).toContain('Через');
  });
});
