import Link from "next/link";
import { notFound } from "next/navigation";

import {
  approveRegistrationAction,
  rejectRegistrationAction,
  waitlistRegistrationAction
} from "@/app/actions";
import { currency, number, shortDate } from "@/lib/format";
import { getRegistrationDetail } from "@/lib/repository";
import { registrationStatusClass } from "@/lib/status";

export default async function RegistrationDetailPage({
  params
}: {
  params: Promise<{ eventId: string; registrationId: string }>;
}) {
  const { eventId, registrationId } = await params;
  const detail = await getRegistrationDetail(registrationId);
  if (!detail) notFound();
  const { creator, registration, response, attendance, qr, event } = detail;

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <Link className="text-sm font-bold text-cyan-700" href={`/admin/events/${eventId}/registrations`}>
          Back to registrations
        </Link>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_auto]">
          <div>
            <h1 className="text-3xl font-black text-ink">{creator.full_name}</h1>
            <p className="mt-1 text-slate-600">@{creator.tiktok_username} - {event?.event_name}</p>
            <a className="mt-2 inline-flex font-bold text-cyan-700 underline" href={creator.tiktok_profile_url} target="_blank" rel="noreferrer">
              {creator.tiktok_profile_url}
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`status-pill ${registrationStatusClass(registration.registration_status)}`}>
              {registration.registration_status}
            </span>
            <span className="status-pill bg-slate-100 text-slate-700">{attendance?.status || "not_checked_in"}</span>
            {qr ? <span className="status-pill bg-green-50 text-green-700">{qr.status}</span> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="tap-card p-5">
          <h2 className="text-xl font-black text-ink">Creator Profile</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Email" value={creator.email} />
            <Info label="Mobile" value={creator.mobile} />
            <Info label="Location" value={creator.location} />
            <Info label="GMV Max" value={currency(creator.gmv_max_total)} />
            <Info label="TikTok Followers" value={number(creator.follower_count)} />
            <Info label="Category" value={creator.creator_category} />
            <Info label="Content Categories" value={creator.content_categories.join(", ")} />
            <Info label="Affiliate Experience" value={creator.affiliate_experience} />
            <Info label="Registered" value={shortDate(registration.registered_at)} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <form action={approveRegistrationAction}>
              <input type="hidden" name="registration_id" value={registration.id} />
              <input type="hidden" name="event_id" value={eventId} />
              <button className="tap-button tap-button-primary" type="submit">Approve</button>
            </form>
            <form action={waitlistRegistrationAction}>
              <input type="hidden" name="registration_id" value={registration.id} />
              <input type="hidden" name="event_id" value={eventId} />
              <button className="tap-button tap-button-secondary" type="submit">Waitlist</button>
            </form>
            <form action={rejectRegistrationAction}>
              <input type="hidden" name="registration_id" value={registration.id} />
              <input type="hidden" name="event_id" value={eventId} />
              <button className="tap-button tap-button-danger" type="submit">Reject</button>
            </form>
            {qr ? <Link className="tap-button tap-button-secondary" href={`/qr/${qr.qr_token}`}>View QR</Link> : null}
          </div>
        </section>

        <section className="tap-card p-5">
          <h2 className="text-xl font-black text-ink">Submitted Form Response</h2>
          <div className="mt-4 grid gap-3">
            {response?.field_snapshot.map((field) => {
              const value = response.answers[field.id];
              return <Info key={field.id} label={field.label} value={Array.isArray(value) ? value.join(", ") : String(value || "-")} />;
            })}
          </div>
        </section>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}
