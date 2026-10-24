import Link from "next/link";

import {
  approveRegistrationAction,
  rejectRegistrationAction,
  waitlistRegistrationAction
} from "@/app/actions";
import { currency, number, shortDate } from "@/lib/format";
import { getEventById, listRegistrations } from "@/lib/repository";
import { attendanceStatusClass, registrationStatusClass } from "@/lib/status";

export default async function RegistrationsPage({
  params,
  searchParams
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{
    q?: string;
    gmvMin?: string;
    gmvMax?: string;
    followersMin?: string;
    followersMax?: string;
    category?: string;
    status?: string;
    attendance?: string;
  }>;
}) {
  const { eventId } = await params;
  const {
    q = "",
    gmvMin = "",
    gmvMax = "",
    followersMin = "",
    followersMax = "",
    category = "",
    status = "",
    attendance = ""
  } = await searchParams;
  const event = await getEventById(eventId);
  const rows = await listRegistrations(eventId, q);
  const numericGmvMin = Number(gmvMin || 0);
  const numericGmvMax = Number(gmvMax || 0);
  const numericFollowersMin = Number(followersMin || 0);
  const numericFollowersMax = Number(followersMax || 0);
  const categories = Array.from(new Set(rows.map(({ creator }) => creator.creator_category).filter(Boolean))).sort();
  const filteredRows = rows.filter(({ registration, creator, attendance: attendanceRow }) => {
    const gmvMatch = (!gmvMin || creator.gmv_max_total >= numericGmvMin) && (!gmvMax || creator.gmv_max_total <= numericGmvMax);
    const followersMatch =
      (!followersMin || creator.follower_count >= numericFollowersMin) &&
      (!followersMax || creator.follower_count <= numericFollowersMax);
    const categoryMatch = !category || creator.creator_category === category;
    const statusMatch = !status || registration.registration_status === status;
    const attendanceMatch = !attendance || (attendanceRow?.status || "not_checked_in") === attendance;
    return gmvMatch && followersMatch && categoryMatch && statusMatch && attendanceMatch;
  });

  return (
    <section className="tap-card overflow-hidden">
      <div className="grid gap-5 border-b border-slate-200 p-5">
        <div>
          <h1 className="text-3xl font-black text-ink">Event Registrations</h1>
          <p className="mt-2 text-slate-600">{event?.event_name || "Selected event"} registrations and form responses.</p>
          <Link className="mt-3 inline-flex text-sm font-bold text-cyan-700" href="/admin/registrations">
            Change event
          </Link>
        </div>
        <form className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          <label className="tap-label">
            Search
            <input className="tap-input" name="q" placeholder="Name, TikTok, mobile, email" defaultValue={q} />
          </label>
          <label className="tap-label">
            Category
            <select className="tap-input" name="category" defaultValue={category}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="tap-label">
            GMV Min
            <input className="tap-input" name="gmvMin" type="number" min={0} placeholder="0" defaultValue={gmvMin} />
          </label>
          <label className="tap-label">
            GMV Max
            <input className="tap-input" name="gmvMax" type="number" min={0} placeholder="500000" defaultValue={gmvMax} />
          </label>
          <label className="tap-label">
            TikTok Followers Min
            <input className="tap-input" name="followersMin" type="number" min={0} placeholder="0" defaultValue={followersMin} />
          </label>
          <label className="tap-label">
            TikTok Followers Max
            <input className="tap-input" name="followersMax" type="number" min={0} placeholder="100000" defaultValue={followersMax} />
          </label>
          <label className="tap-label">
            Status
            <select className="tap-input" name="status" defaultValue={status}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="tap-label">
            Attendance
            <select className="tap-input" name="attendance" defaultValue={attendance}>
              <option value="">All attendance</option>
              <option value="not_checked_in">Not checked in</option>
              <option value="checked_in">Checked in</option>
              <option value="checked_out">Checked out</option>
            </select>
          </label>
          <div className="flex items-end gap-2 md:col-span-4 xl:col-span-8">
            <button className="tap-button tap-button-primary" type="submit">
              Apply Filters
            </button>
            <Link className="tap-button tap-button-secondary" href={`/admin/events/${eventId}/registrations`}>
              Clear
            </Link>
          </div>
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50 text-sm font-black uppercase text-slate-500">
            <tr>
              <th className="p-4">Creator</th>
              <th className="p-4">TikTok URL</th>
              <th className="p-4">GMV Max</th>
              <th className="p-4">TikTok Followers</th>
              <th className="p-4">Category</th>
              <th className="p-4">Registered</th>
              <th className="p-4">Status</th>
              <th className="p-4">Attendance</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(({ registration, creator, attendance, qr }) => (
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
                  <span className={`status-pill ${attendanceStatusClass(attendance?.status || "not_checked_in")}`}>{attendance?.status || "not_checked_in"}</span>
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
      {filteredRows.length === 0 ? <div className="p-8 text-center text-slate-500">No registrations match the selected filters.</div> : null}
    </section>
  );
}
