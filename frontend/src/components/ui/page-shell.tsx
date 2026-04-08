import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export function PageShell({ title, subtitle, children }: Props) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
        <p className="text-sm font-medium uppercase tracking-wide text-brand">Belavia self-service</p>
        <h1 className="mt-2">{title}</h1>
        <p className="mt-2 text-base text-slate-600">{subtitle}</p>
      </header>
      {children}
    </main>
  );
}
