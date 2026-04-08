import { describe, expect, it } from 'vitest';

import { getEligibilityMeta, getOperationStatusMeta, getOrderStatusMeta } from '@/lib/status';

describe('status helpers', () => {
  it('maps order statuses to labels', () => {
    expect(getOrderStatusMeta('UPCOMING').label).toBe('Предстоящий');
  });

  it('maps blocked operations to danger tone', () => {
    expect(getOperationStatusMeta('BLOCKED').tone).toBe('danger');
  });

  it('maps paid eligibility to warning label', () => {
    expect(getEligibilityMeta({ available: true, requiresPayment: true }).label).toContain('доплатой');
  });
});
