import { SecondaryButton } from '@/components/ui/secondary-button';

type ErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Не удалось загрузить данные',
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="rounded-[28px] border border-red-200 bg-white p-8 shadow-card shadow-slate-900/5">
      <div className="text-xl font-semibold text-slate-950">{title}</div>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
      {onRetry ? (
        <div className="mt-5">
          <SecondaryButton onClick={onRetry} type="button">
            Повторить
          </SecondaryButton>
        </div>
      ) : null}
    </section>
  );
}
