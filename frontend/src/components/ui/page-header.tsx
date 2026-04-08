import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow = 'Личный кабинет',
  title,
  subtitle,
  backHref,
  backLabel = 'Назад',
  actions,
}: PageHeaderProps) {
  return (
    <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-card shadow-slate-900/5 backdrop-blur sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          {backHref ? (
            <Link className="inline-flex text-sm font-semibold text-brand hover:text-brand/80" to={backHref}>
              {`← ${backLabel}`}
            </Link>
          ) : null}
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-brand/80">{eyebrow}</div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{subtitle}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
