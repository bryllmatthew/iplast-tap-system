import Link from "next/link";
import { CalendarDays, Clock, MapPin, QrCode } from "lucide-react";

import type { Event } from "@/lib/types";
import { eventTimeRange, shortDate } from "@/lib/format";
import { listEvents } from "@/lib/repository";
import { eventStatusClass } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function PublicEventsPage() {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  const publicEvents = (await listEvents()).filter((event) =>
    ["published", "registration_closed", "ongoing", "completed"].includes(event.status)
  );
  const upcomingEvents = publicEvents
    .filter((event) => event.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 3);
  const pastEvents = publicEvents
    .filter((event) => event.event_date < today)
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
    .slice(0, 3);

  return (
    <main className="tap-shell py-8">
      <section className="mb-6">
        <p className="text-sm font-black uppercase text-cyan-700">TAP Events</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Upcoming and past events</h1>
        <p className="mt-2 max-w-2xl text-slate-600">Choose an event, register, and save your creator QR for onsite check-in and sample claims.</p>
      </section>

      <EventSection title="Upcoming" events={upcomingEvents} emptyText="No upcoming events are published yet." />
      <EventSection title="Past" events={pastEvents} emptyText="Past events will appear here after event dates pass." isPast />
    </main>
  );
}

function EventSection({
  title,
  events,
  emptyText,
  isPast = false
}: {
  title: string;
  events: Event[];
  emptyText: string;
  isPast?: boolean;
}) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-ink">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">Showing up to 3 {title.toLowerCase()} events.</p>
        </div>
      </div>
      {events.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} isPast={isPast} />
          ))}
        </div>
      ) : (
        <div className="tap-card p-5 text-sm font-bold text-slate-500">{emptyText}</div>
      )}
    </section>
  );
}

function EventCard({ event, isPast }: { event: Event; isPast: boolean }) {
  return (
    <article className="tap-card overflow-hidden">
      <img className="h-52 w-full object-cover" src={event.poster_url} alt="" />
      <div className="p-5">
        <span className={`status-pill ${isPast ? "bg-slate-100 text-slate-700" : eventStatusClass(event.status)}`}>
          {isPast ? "past" : event.status}
        </span>
        <h3 className="mt-3 text-xl font-black text-ink">{event.event_name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{event.description}</p>
        <div className="mt-4 grid gap-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4 text-cyan-700" />
            {shortDate(event.event_date)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="size-4 text-cyan-700" />
            {eventTimeRange(event.start_time, event.end_time)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 text-cyan-700" />
            {event.venue}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {!isPast ? (
            <Link className="tap-button tap-button-primary" href={`/events/${event.event_slug}/register`}>
              <QrCode className="size-4" />
              Register
            </Link>
          ) : null}
          <Link className="tap-button tap-button-secondary" href={`/events/${event.event_slug}`}>
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
