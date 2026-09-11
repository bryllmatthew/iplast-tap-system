import Link from "next/link";

import {
  approveRegistrationAction,
  rejectRegistrationAction,
  waitlistRegistrationAction
} from "@/app/actions";
import { currency, number, shortDate } from "@/lib/format";
import { getEventById, listRegistrations } from "@/lib/repository";
import { registrationStatusClass } from "@/lib/status";

export default async function RegistrationsPage({
  params,
  searchParams
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { eventId } = await params;
  const { q = "" } = await searchParams;
  const event = await getEventById(eventId);
  const rows = await listRegistrations(eventId, q);

  return (
    <section className="tap-card overflow-hidden">
      <div className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-3xl font-black text-ink">Event Registrations</h1>
          <p className="mt-2 text-slate-600">{event?.event_name || "Selected event"} registrations and form responses.</p>
          <Link className="mt-3 inline-flex text-sm font-bold text-cyan-700" href="/admin/registrations">
            Change event
          </Link>
        </div>
        <form>
          <label className="tap-label">
            Search
            <input className="tap-input" name="q" placeholder="Name, TikTok, mobile, email" defaultValue={q} />
          </label>
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50 text-sm font-black uppercase text-slate-500">
            <tr>
              <th className="p-4">Creator</th>
              <th className="p-4">TikTok URL</th>
              <th className="p-4">GMV Max</th>
              <th className="p-4">Followers</th>
              <th className="p-4">Category</th>
              <th className="p-4">Registered</th>
              <th className="p-4">Status</th>
              <th className="p-4">Attendance</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ registration, creator, attendance, qr }) => (
              <tr key={registration.id} className="border-t border-slate-100 align-top">
                <td className="p-4">
                  <p className="font-black text-ink">{creator.full_name}</p>
                  <p className="text-sm text-slate-500">@{creator.tiktok_username}</p>
                  <p className="text-xs text-slate-400">{creator.email}</p>
                </td>
                <td className="p-4">
                  <a className="font-bold text-cyan-700 underline" href={creator.tiktok_profile_url} target="_blank" rel="noreferrer">
                    Profile
                  </a>
                </td>
                <td className="p-4 font-bold text-slate-700">{currency(creator.gmv_max_total)}</td>
                <td className="p-4 text-slate-600">{number(creator.follower_count)}</td>
                <td className="p-4 text-slate-600">{creator.creator_category}</td>
                <td className="p-4 text-slate-600">{shortDate(registration.registered_at)}</td>
                <td className="p-4">
                  <span className={`status-pill ${registrationStatusClass(registration.registration_status)}`}>
                    {registration.registration_status}
                  </span>
                </td>
                <td className="p-4">
                  <span className="status-pill bg-slate-100 text-slate-700">{attendance?.status || "not_checked_in"}</span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={approveRegistrationAction}>
                      <input type="hidden" name="registration_id" value={registration.id} />
                      <input type="hidden" name="event_id" value={eventId} />
                      <button className="tap-button tap-button-primary" type="submit">
                        Approve
                      </button>
                    </form>
                    <form action={waitlistRegistrationAction}>
                      <input type="hidden" name="registration_id" value={registration.id} />
                      <input type="hidden" name="event_id" value={eventId} />
                      <button className="tap-button tap-button-secondary" type="submit">
                        Waitlist
                      </button>
                    </form>
                    <form action={rejectRegistrationAction}>
                      <input type="hidden" name="registration_id" value={registration.id} />
                      <input type="hidden" name="event_id" value={eventId} />
                      <button className="tap-button tap-button-danger" type="submit">
                        Reject
                      </button>
                    </form>
                    {qr ? (
                      <Link className="tap-button tap-button-secondary" href={`/qr/${qr.qr_token}`}>
                        View QR
                      </Link>
                    ) : null}
                    <Link className="tap-button tap-button-secondary" href={`/admin/events/${registration.event_id}/registrations/${registration.id}`}>
                      Review
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
