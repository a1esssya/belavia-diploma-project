import { describe, expect, it } from 'vitest';

import {
  getOperationAvailabilityMeta,
  getOperationStatusMeta,
  getOrderStatusMeta,
} from '@/lib/status';

describe('status helpers', () => {
  it('maps order statuses to readable labels', () => {
    expect(getOrderStatusMeta('UPCOMING').label).toBe('Предстоящий');
  });

  it('maps blocked operations to danger tone', () => {
    expect(getOperationStatusMeta('BLOCKED').tone).toBe('danger');
  });

  it('shows surcharge for exchange availability', () => {
    expect(
      getOperationAvailabilityMeta('exchange', 'UPCOMING', {
        available: true,
        requiresPayment: true,
      }).label,
    ).toBe('Обмен с доплатой');
  });

  it('forces cancelled orders to unavailable state', () => {
    expect(
      getOperationAvailabilityMeta('refund', 'CANCELLED', {
        available: true,
      }).reason,
    ).toBe('Возврат недоступен, потому что заказ отменён.');
  });
});
