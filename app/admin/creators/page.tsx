import Link from "next/link";
import { BadgeCheck, Gift, Search, Users } from "lucide-react";

import { currency, number, shortDate } from "@/lib/format";
import { listAttendedCreators } from "@/lib/repository";

export default async function CreatorsDatabasePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const rows = await listAttendedCreators(q);

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm font-black uppercase text-cyan-700">Creators Database</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Checked-in creators</h1>
            <p className="mt-2 text-slate-600">Creators appear here after staff checks them in for an event.</p>
          </div>
          <form>
            <label className="tap-label">
              <span className="inline-flex items-center gap-2">
                <Search className="size-4" />
                Search
              </span>
              <input className="tap-input" name="q" placeholder="Name, TikTok, email, mobile" defaultValue={q} />
            </label>
          </form>
        </div>
      </div>

      <div className="grid gap-4">
        {rows.map(({ creator, attendance, event, claims }) => (
          <article key={`${creator.id}-${attendance.id}`} className="tap-card p-5 hover:border-cyan-400">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-ink">{creator.full_name}</h2>
                  <span className="status-pill bg-green-50 text-green-700">attended</span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-500">@{creator.tiktok_username}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold">
                  <Link className="text-cyan-700 underline" href={`/admin/creators/${creator.id}`}>
                    View creator details
                  </Link>
                  <a className="text-cyan-700 underline" href={creator.tiktok_profile_url} target="_blank" rel="noreferrer">
                    TikTok profile
                  </a>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <Metric icon={<Users className="size-4" />} label="Followers" value={number(creator.follower_count)} />
                <Metric icon={<BadgeCheck className="size-4" />} label="GMV Max" value={currency(creator.gmv_max_total)} />
                <Metric icon={<Gift className="size-4" />} label="Samples" value={number(claims.length)} />
                <Metric icon={<BadgeCheck className="size-4" />} label="Checked In" value={shortDate(attendance.checked_in_at || event.event_date)} />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">{event.event_name}</p>
          </article>
        ))}
        {rows.length === 0 ? (
          <div className="tap-card p-8 text-center text-slate-500">No checked-in creators found.</div>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="mb-2 text-cyan-700">{icon}</div>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-ink">{value}</p>
    </div>
  );
}
