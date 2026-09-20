import Link from "next/link";

import { checkInCreatorAction } from "@/app/actions";
import { currency, number, time } from "@/lib/format";
import { listRegistrations } from "@/lib/repository";
import { registrationStatusClass } from "@/lib/status";

export default async function CheckInPage({
  params,
  searchParams
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ q?: string; message?: string; token?: string }>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const rows = await listRegistrations(eventId, query.q || "");

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <h1 className="text-3xl font-black text-ink">Creator Check-In</h1>
        <p className="mt-2 text-slate-600">Search approved creators, check them in, and allocate event QR codes.</p>
        <form className="mt-4 max-w-xl">
          <label className="tap-label">
            Search creator
            <input className="tap-input" name="q" placeholder="Name, TikTok username, or mobile" defaultValue={query.q || ""} />
          </label>
        </form>
        {query.message ? (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 font-bold text-green-800">
            {query.message}
            {query.token ? (
              <Link className="ml-3 underline" href={`/qr/${query.token}`}>
                View QR
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4">
        {rows.map(({ registration, creator, attendance, qr }) => (
          <article key={registration.id} className="tap-card p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-ink">{creator.full_name}</h2>
                  <span className={`status-pill ${registrationStatusClass(registration.registration_status)}`}>
                    {registration.registration_status}
                  </span>
                  <span className="status-pill bg-slate-100 text-slate-700">{attendance?.status || "not_checked_in"}</span>
                </div>
                <p className="mt-1 font-bold text-slate-500">@{creator.tiktok_username}</p>
                <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <span>GMV: {currency(creator.gmv_max_total)}</span>
                  <span>TikTok Followers: {number(creator.follower_count)}</span>
                  <span>{creator.mobile}</span>
                </div>
                {attendance?.checked_in_at ? (
                  <p className="mt-3 text-sm font-bold text-green-700">
                    Already checked in at {time(attendance.checked_in_at)} by {attendance.checked_in_by}
                  </p>
                ) : null}
              </div>
              <form action={checkInCreatorAction}>
                <input type="hidden" name="registration_id" value={registration.id} />
                <input type="hidden" name="event_id" value={eventId} />
                <div className="grid gap-2">
                  <button
                    className={`tap-button w-full md:w-auto ${
                      attendance?.status === "checked_in" ? "tap-button-success" : "tap-button-primary"
                    }`}
                    disabled={registration.registration_status !== "approved" || attendance?.status === "checked_in"}
                    type="submit"
                  >
                    {attendance?.status === "checked_in" ? "Already Checked In" : "Check In Creator"}
                  </button>
                  {qr ? (
                    <Link className="tap-button tap-button-secondary w-full md:w-auto" href={`/qr/${qr.qr_token}`}>
                      View QR
                    </Link>
                  ) : null}
                </div>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
