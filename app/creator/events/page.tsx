import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { eventTimeRange, number, shortDate, time } from "@/lib/format";
import { getCreatorPortalOverview } from "@/lib/repository";
import { registrationStatusClass } from "@/lib/status";

export default async function CreatorEventsPage({
  searchParams
}: {
  searchParams: Promise<{ registration?: string }>;
}) {
  const user = await requireAuth("creator");
  const query = await searchParams;
  const overview = await getCreatorPortalOverview(user.id);
  if (!overview) redirect("/login?role=creator&next=/creator/events");
  const selectedRow = overview.registrations.find(({ registration }) => registration.id === query.registration);

  if (selectedRow) {
    const { registration, event, attendance, qr } = selectedRow;
    const eventClaims = overview.sampleClaims.filter(({ claim }) => claim.event_id === event.id);
    const totalSamples = eventClaims.reduce((total, { claim }) => total + claim.quantity, 0);

    return (
      <section className="space-y-5">
        <div className="tap-card p-5">
          <Link className="text-sm font-bold text-cyan-700" href="/creator/events">
            Back to My Events
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-ink">{event.event_name}</h1>
              <p className="mt-2 text-slate-600">{shortDate(event.event_date)} at {eventTimeRange(event.start_time, event.end_time)} - {event.venue}</p>
              {attendance?.checked_in_at ? <p className="mt-2 text-sm font-bold text-cyan-700">Checked in {time(attendance.checked_in_at)}</p> : null}
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
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Info label="Samples Claimed" value={number(totalSamples)} />
          <Info label="Brands Sampled" value={number(new Set(eventClaims.map(({ brand }) => brand.id)).size)} />
          <Info label="Products Sampled" value={number(new Set(eventClaims.map(({ product }) => product.id)).size)} />
        </div>

        <section className="tap-card p-5">
          <h2 className="text-xl font-black text-ink">Samples From This Event</h2>
          <div className="mt-4 grid gap-3">
            {eventClaims.map(({ claim, brand, product, seller }) => (
              <div key={claim.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-black text-ink">{product.product_name}</p>
                  <p className="mt-1 text-sm text-slate-500">{brand.brand_name} - {seller.company_name}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-black text-ink">Qty {number(claim.quantity)}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{time(claim.claimed_at)}</p>
                </div>
              </div>
            ))}
            {!eventClaims.length ? <p className="rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-500">No sample claims recorded for this event yet.</p> : null}
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <h1 className="text-3xl font-black text-ink">My Events</h1>
        <p className="mt-2 text-slate-600">Select an event to view your check-in history, sample claims, and QR links.</p>
      </div>

      <section className="tap-card overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-black text-ink">Event Records</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {overview.registrations.map(({ registration, event, attendance }) => {
            const eventClaims = overview.sampleClaims.filter(({ claim }) => claim.event_id === event.id);
            const totalSamples = eventClaims.reduce((total, { claim }) => total + claim.quantity, 0);

            return (
              <Link key={registration.id} className="campaign-card block p-4 hover:border-cyan-400" href={`/creator/events?registration=${registration.id}`}>
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="campaign-card-title font-black text-ink">{event.event_name}</p>
                    <p className="campaign-card-meta mt-1 text-sm text-slate-500">{shortDate(event.event_date)} at {eventTimeRange(event.start_time, event.end_time)} - {event.venue}</p>
                    <p className="campaign-card-meta mt-1 text-sm font-bold text-slate-500">
                      {attendance?.checked_in_at ? `Checked in ${time(attendance.checked_in_at)}` : "Not checked in yet"} · {number(totalSamples)} samples claimed
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <span className={`status-pill ${registrationStatusClass(registration.registration_status)}`}>{registration.registration_status}</span>
                    <span className="status-pill bg-slate-100 text-slate-700">{attendance?.status || "not_checked_in"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {!overview.registrations.length ? <div className="p-8 text-center font-bold text-slate-500">No event registrations yet.</div> : null}
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
