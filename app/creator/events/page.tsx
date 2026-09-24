import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { eventTimeRange, number, shortDate, time } from "@/lib/format";
import { getCreatorPortalOverview } from "@/lib/repository";
import { registrationStatusClass } from "@/lib/status";

export default async function CreatorEventsPage() {
  const user = await requireAuth("creator");
  const overview = await getCreatorPortalOverview(user.id);
  if (!overview) redirect("/login?role=creator&next=/creator/events");
  const attendedRows = overview.registrations.filter(({ attendance }) => attendance?.status === "checked_in");
  const activeRows = overview.registrations.filter(({ attendance }) => attendance?.status !== "checked_in");

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <h1 className="text-3xl font-black text-ink">My Events</h1>
        <p className="mt-2 text-slate-600">View your attended events, check-in history, sample claims, and active registration QR links.</p>
      </div>

      <section className="space-y-3">
        <h2 className="px-1 text-xl font-black text-ink">Events Attended</h2>
        <div className="grid gap-4">
          {attendedRows.map(({ registration, event, attendance, qr }) => {
            const eventClaims = overview.sampleClaims.filter(({ claim }) => claim.event_id === event.id);
            const totalSamples = eventClaims.reduce((total, { claim }) => total + claim.quantity, 0);

            return (
              <article key={registration.id} className="tap-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-ink">{event.event_name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{shortDate(event.event_date)} at {eventTimeRange(event.start_time, event.end_time)} - {event.venue}</p>
                    {attendance?.checked_in_at ? <p className="mt-2 text-sm font-bold text-cyan-700">Checked in {time(attendance.checked_in_at)}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`status-pill ${registrationStatusClass(registration.registration_status)}`}>{registration.registration_status}</span>
                    <span className="status-pill bg-green-50 text-green-700">checked_in</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Info label="Samples Claimed" value={number(totalSamples)} />
                  <Info label="Brands Sampled" value={number(new Set(eventClaims.map(({ brand }) => brand.id)).size)} />
                  <Info label="Products Sampled" value={number(new Set(eventClaims.map(({ product }) => product.id)).size)} />
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <h4 className="text-sm font-black uppercase text-slate-400">Samples From This Event</h4>
                  <div className="mt-3 grid gap-2">
                    {eventClaims.map(({ claim, brand, product, seller }) => (
                      <div key={claim.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
                        <div>
                          <p className="font-black text-ink">{product.product_name}</p>
                          <p className="mt-1 text-sm text-slate-500">{brand.brand_name} - {seller.company_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-ink">Qty {number(claim.quantity)}</p>
                          <p className="mt-1 text-xs font-bold text-slate-500">{time(claim.claimed_at)}</p>
                        </div>
                      </div>
                    ))}
                    {!eventClaims.length ? <p className="text-sm font-bold text-slate-500">No sample claims recorded for this event yet.</p> : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="tap-button tap-button-secondary" href={`/events/${event.event_slug}`}>View Event</Link>
                  {qr ? <Link className="tap-button tap-button-primary" href={`/qr/${qr.qr_token}`}>View QR</Link> : null}
                </div>
              </article>
            );
          })}
          {!attendedRows.length ? <div className="tap-card p-8 text-center font-bold text-slate-500">No checked-in event history yet.</div> : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-xl font-black text-ink">Active Registrations</h2>
      <div className="grid gap-4">
        {activeRows.map(({ registration, event, attendance, qr }) => (
          <article key={registration.id} className="tap-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-ink">{event.event_name}</h3>
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
        {!activeRows.length ? <div className="tap-card p-8 text-center font-bold text-slate-500">No active event registrations.</div> : null}
      </div>
      </section>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-ink">{value}</p>
    </div>
  );
}
