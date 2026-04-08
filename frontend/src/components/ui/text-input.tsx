import { InputHTMLAttributes } from 'react';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string | null;
};

export function TextInput({ label, hint, error, className, id, ...props }: TextInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className={[
          'min-h-14 w-full rounded-2xl border bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400',
          error
            ? 'border-red-400 bg-red-50/70 focus:border-red-500'
            : 'border-slate-200 focus:border-brand focus:bg-white',
          className ?? '',
        ].join(' ')}
        id={inputId}
        {...props}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
    </label>
  );
}
