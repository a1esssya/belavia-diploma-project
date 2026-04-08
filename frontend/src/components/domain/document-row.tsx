import type { OrderDocument } from '@/lib/types';
import { formatDateTime, toSentenceCase } from '@/lib/format';

type DocumentRowProps = {
  document: OrderDocument;
};

export function DocumentRow({ document }: DocumentRowProps) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="text-lg font-semibold text-slate-950">{document.title}</div>
        <div className="text-sm text-slate-500">{toSentenceCase(document.type.replace(/_/g, ' '))}</div>
        <div className="text-sm text-slate-500">{document.fileName}</div>
        <div className="text-sm text-slate-500">
          {document.lastSentAt
            ? `Последняя отправка: ${formatDateTime(document.lastSentAt)}`
            : 'Документ ещё не отправлялся повторно'}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <a
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-brand transition hover:bg-brand/5"
          href={document.url}
          rel="noreferrer"
          target="_blank"
        >
          Открыть
        </a>
      </div>
    </article>
  );
}
