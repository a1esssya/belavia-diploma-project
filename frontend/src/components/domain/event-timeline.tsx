import { formatDateTime } from '@/lib/format';
import type { TimelineEvent } from '@/lib/history';

type EventTimelineProps = {
  events: TimelineEvent[];
};

export function EventTimeline({ events }: EventTimelineProps) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div className="flex gap-4" key={event.id}>
          <div className="flex w-5 flex-col items-center">
            <div className="mt-1 h-3 w-3 rounded-full bg-brand" />
            {index !== events.length - 1 ? <div className="mt-2 min-h-12 w-px flex-1 bg-slate-200" /> : null}
          </div>
          <article className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-base font-semibold text-slate-950">{event.title}</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">{event.description}</div>
            <div className="mt-3 text-sm text-slate-500">{formatDateTime(event.createdAt)}</div>
          </article>
        </div>
      ))}
    </div>
  );
}
