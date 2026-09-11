import Link from "next/link";
import { CalendarDays, MapPin, Plus } from "lucide-react";

import { number, shortDate } from "@/lib/format";
import { listEvents, listRegistrations } from "@/lib/repository";
import { eventStatusClass } from "@/lib/status";

export default async function EventsPage() {
  const events = await listEvents();
  const rows = await Promise.all(
    events.map(async (event) => ({
      event,
      registrations: await listRegistrations(event.id)
    }))
  );

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-ink">Events</h1>
            <p className="mt-2 text-slate-600">Create, publish, operate, and review each TAP event from one place.</p>
          </div>
          <Link className="tap-button tap-button-primary" href="/admin/events/new">
            <Plus className="size-4" />
            New Event
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {rows.map(({ event, registrations }) => {
          const approved = registrations.filter((row) => row.registration.registration_status === "approved").length;
          const checkedIn = registrations.filter((row) => row.attendance?.status === "checked_in").length;
          return (
            <article key={event.id} className="tap-card overflow-hidden">
              <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
                <img className="h-full min-h-48 w-full object-cover" src={event.poster_url} alt="" />
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className={`status-pill ${eventStatusClass(event.status)}`}>{event.status}</span>
                      <h2 className="mt-3 text-xl font-black text-ink">{event.event_name}</h2>
                      <div className="mt-3 grid gap-2 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="size-4 text-cyan-700" />
                          {shortDate(event.event_date)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="size-4 text-cyan-700" />
                          {event.venue}
                        </span>
                      </div>
                    </div>
                    <Link className="tap-button tap-button-primary" href={`/admin/events/${event.id}`}>
                      Open Event
                    </Link>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Metric label="Registrants" value={registrations.length} />
                    <Metric label="Approved" value={approved} />
                    <Metric label="Checked In" value={checkedIn} />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-ink">{number(value)}</p>
    </div>
  );
}
