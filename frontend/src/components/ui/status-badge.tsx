import { PropsWithChildren } from 'react';

import type { StatusTone } from '@/lib/status';

type StatusBadgeProps = PropsWithChildren<{
  tone?: StatusTone;
}>;

const toneClasses: Record<StatusTone, string> = {
  brand: 'border border-brand/15 bg-brand/8 text-brand',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border border-red-200 bg-red-50 text-red-700',
  neutral: 'border border-slate-200 bg-slate-50 text-slate-700',
};

export function StatusBadge({ children, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold leading-none ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
