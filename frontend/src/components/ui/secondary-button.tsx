import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type SecondaryButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean;
    fullWidth?: boolean;
  }
>;

export function SecondaryButton({
  children,
  className,
  disabled,
  fullWidth = false,
  isLoading = false,
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      className={[
        'inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-brand transition',
        'hover:border-brand/30 hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        'disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400',
        fullWidth ? 'w-full' : '',
        className ?? '',
      ].join(' ')}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Загрузка...' : children}
    </button>
  );
}
