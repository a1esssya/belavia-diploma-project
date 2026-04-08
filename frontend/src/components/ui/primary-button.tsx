import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type PrimaryButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean;
    fullWidth?: boolean;
  }
>;

export function PrimaryButton({
  children,
  className,
  disabled,
  isLoading = false,
  fullWidth = false,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={[
        'inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand/20 transition',
        'hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        'disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none',
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
