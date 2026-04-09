import { Link } from 'react-router-dom';

type SuccessStateProps = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export function SuccessState({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: SuccessStateProps) {
  return (
    <section className="rounded-[32px] border border-white/70 bg-white p-8 text-center shadow-card shadow-slate-900/5">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg aria-hidden="true" className="h-10 w-10" fill="none" viewBox="0 0 24 24">
          <path
            d="M7 12.5 10.5 16 17.5 9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
        </svg>
      </div>
      <h2 className="mt-6 text-3xl font-bold text-slate-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">{description}</p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand/90"
          to={primaryHref}
        >
          {primaryLabel}
        </Link>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5"
          to={secondaryHref}
        >
          {secondaryLabel}
        </Link>
      </div>
    </section>
  );
}
