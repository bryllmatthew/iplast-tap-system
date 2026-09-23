import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { eventTimeRange, shortDate } from "@/lib/format";
import { getCreatorPortalOverview } from "@/lib/repository";
import { registrationStatusClass } from "@/lib/status";

export default async function CreatorEventsPage() {
  const user = await requireAuth("creator");
  const overview = await getCreatorPortalOverview(user.id);
  if (!overview) redirect("/login?role=creator&next=/creator/events");

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <h1 className="text-3xl font-black text-ink">My Events</h1>
        <p className="mt-2 text-slate-600">View your TAP registrations, approval status, check-in status, and event QR links.</p>
      </div>
      <div className="grid gap-4">
        {overview.registrations.map(({ registration, event, attendance, qr }) => (
          <article key={registration.id} className="tap-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-ink">{event.event_name}</h2>
                <p className="mt-1 text-sm text-slate-500">{shortDate(event.event_date)} at {eventTimeRange(event.start_time, event.end_time)} - {event.venue}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`status-pill ${registrationStatusClass(registration.registration_status)}`}>{registration.registration_status}</span>
                <span className="status-pill bg-slate-100 text-slate-700">{attendance?.status || "not_checked_in"}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="tap-button tap-button-secondary" href={`/events/${event.event_slug}`}>View Event</Link>
              {qr ? <Link className="tap-button tap-button-primary" href={`/qr/${qr.qr_token}`}>View QR</Link> : null}
            </div>
          </article>
        ))}
        {!overview.registrations.length ? <div className="tap-card p-8 text-center font-bold text-slate-500">No event registrations yet.</div> : null}
      </div>
    </section>
  );
}
