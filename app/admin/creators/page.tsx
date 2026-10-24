import Link from "next/link";
import { Search, Users } from "lucide-react";

import { number, shortDate } from "@/lib/format";
import { listCreatorDatabase } from "@/lib/repository";

export default async function CreatorsDatabasePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const rows = await listCreatorDatabase(q);

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm font-black uppercase text-cyan-700">Creators Database</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Creator database</h1>
        <p className="mt-2 text-slate-600">Creators who joined the community or attended a TAP event.</p>
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

      <div className="tap-card divide-y divide-slate-100 overflow-hidden md:hidden">
        {rows.map(({ creator, isEventCreator, attendedEvents }) => {
          return (
          <Link key={creator.id} className="block px-4 py-3 active:bg-slate-50" href={`/admin/creators/${creator.id}`}>
            <p className="font-black text-ink">{creator.full_name}</p>
            <p className="mt-1 text-sm text-slate-500">{creator.email}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{creator.community_joined_at ? "Community member" : "Event creator"} · {attendedEvents} attended</p>
          </Link>
          );
        })}
        {rows.length === 0 ? <div className="p-8 text-center text-slate-500">No creators found.</div> : null}
      </div>

      <div className="tap-card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="p-4">Creator</th>
                <th className="p-4">TikTok</th>
                <th className="p-4">Event</th>
                <th className="p-4">TikTok Followers</th>
                <th className="p-4">Events Attended</th>
                <th className="p-4">Checked In</th>
              </tr>
            </thead>
            <tbody>
        {rows.map(({ creator, isEventCreator, attendedEvents, latestCheckedInAt }) => {
          return (
          <tr key={creator.id} className="border-t border-slate-100">
            <td className="p-4">
              <Link className="font-black text-cyan-700 underline" href={`/admin/creators/${creator.id}`}>
                {creator.full_name}
              </Link>
              <p className="mt-1 text-xs text-slate-500">{creator.email}</p>
              <span className="mt-2 inline-flex status-pill bg-cyan-50 text-cyan-700">{creator.community_joined_at && isEventCreator ? "Community + Event" : creator.community_joined_at ? "Community" : isEventCreator ? "Event" : "Creator"}</span>
            </td>
            <td className="p-4 font-bold text-slate-600">@{creator.tiktok_username}</td>
            <td className="p-4 text-slate-600">{attendedEvents ? `${attendedEvents} attended` : "No event attendance"}</td>
            <td className="p-4 text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Users className="size-4 text-cyan-700" />
                {number(creator.follower_count)}
              </span>
            </td>
            <td className="p-4 text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Users className="size-4 text-cyan-700" />
                {number(attendedEvents)}
              </span>
            </td>
            <td className="p-4 text-slate-600">{latestCheckedInAt ? shortDate(latestCheckedInAt) : "-"}</td>
          </tr>
          );
        })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? <div className="p-8 text-center text-slate-500">No creators found.</div> : null}
      </div>
    </section>
  );
}
