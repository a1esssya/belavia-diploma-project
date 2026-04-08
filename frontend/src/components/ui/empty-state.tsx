type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-card shadow-slate-900/5">
      <div className="text-xl font-semibold text-slate-950">{title}</div>
      <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
    </section>
  );
}
