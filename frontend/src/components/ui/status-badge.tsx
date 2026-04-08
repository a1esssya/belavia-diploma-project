import { PropsWithChildren } from 'react';

import type { StatusTone } from '@/lib/status';

type StatusBadgeProps = PropsWithChildren<{
  tone?: StatusTone;
}>;

const toneClasses: Record<StatusTone, string> = {
  brand: 'bg-brand/10 text-brand',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  neutral: 'bg-slate-100 text-slate-600',
};

export function StatusBadge({ children, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
