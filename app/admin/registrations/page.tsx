import Link from "next/link";
import { CalendarDays, ClipboardList, MapPin } from "lucide-react";

import { number, shortDate } from "@/lib/format";
import { listEvents, listRegistrations } from "@/lib/repository";

export default async function RegistrationEventPickerPage() {
  const events = await listEvents();
  const counts = await Promise.all(
    events.map(async (event) => ({
      event,
      registrations: await listRegistrations(event.id)
    }))
  );

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <p className="text-sm font-black uppercase text-cyan-700">Registrations</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Choose an event</h1>
        <p className="mt-2 text-slate-600">Registration review starts with an event because each event has its own form and attendance flow.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {counts.map(({ event, registrations }) => {
          const approved = registrations.filter((row) => row.registration.registration_status === "approved").length;
          const checkedIn = registrations.filter((row) => row.attendance?.status === "checked_in").length;
          return (
            <Link key={event.id} className="tap-card block p-5 hover:border-cyan-400" href={`/admin/events/${event.id}/registrations`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="status-pill bg-green-50 text-green-700">{event.status}</span>
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
                <ClipboardList className="size-5 text-cyan-700" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Metric label="Registrants" value={registrations.length} />
                <Metric label="Approved" value={approved} />
                <Metric label="Checked In" value={checkedIn} />
              </div>
            </Link>
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
