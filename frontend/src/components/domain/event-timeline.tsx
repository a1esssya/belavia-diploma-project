import { formatDateTime } from '@/lib/format';
import type { OrderEvent } from '@/lib/types';

type EventTimelineProps = {
  events: OrderEvent[];
};

export function EventTimeline({ events }: EventTimelineProps) {
  return (
    <div className="space-y-5">
      {events.map((event, index) => (
        <div className="flex gap-4" key={event.id}>
          <div className="flex w-5 flex-col items-center">
            <div className="mt-1 h-3 w-3 rounded-full bg-brand" />
            {index !== events.length - 1 ? <div className="mt-2 min-h-12 w-px flex-1 bg-slate-200" /> : null}
          </div>
          <article className="flex-1 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {event.type}
            </div>
            <div className="mt-2 text-base font-semibold text-slate-950">{event.message}</div>
            <div className="mt-2 text-sm text-slate-500">{formatDateTime(event.createdAt)}</div>
          </article>
        </div>
      ))}
    </div>
  );
}
