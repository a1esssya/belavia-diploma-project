import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  title: string;
  description: string;
}>;

export function PlaceholderCard({ title, description, children }: Props) {
  return (
    <section className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-xl">{title}</h2>
      <p className="mt-2 text-base text-slate-600">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
