import Link from "next/link";
import { CalendarDays, ClipboardList, PackageCheck, Store } from "lucide-react";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { number, shortDate } from "@/lib/format";
import { getCreatorPortalOverview } from "@/lib/repository";
import { registrationStatusClass } from "@/lib/status";

export default async function CreatorDashboardPage() {
  const user = await requireAuth("creator");
  const overview = await getCreatorPortalOverview(user.id);
  if (!overview) redirect("/login?role=creator&next=/creator");

  const activeRegistrations = overview.registrations.filter(({ registration }) => ["pending", "approved", "waitlisted"].includes(registration.registration_status));
  const checkedInEvents = overview.registrations.filter(({ attendance }) => attendance?.status === "checked_in");
  const samplesClaimed = overview.sampleClaims.reduce((total, row) => total + row.claim.quantity, 0);

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <p className="text-sm font-black uppercase text-cyan-700">Welcome back</p>
        <h1 className="mt-2 text-3xl font-black text-ink">{overview.creator.full_name}</h1>
        <p className="mt-2 text-slate-600">Track your TAP event history, sample claims, and upcoming campaign access from here.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Store className="size-5" />} label="Active Campaigns" value="0" />
        <Metric icon={<ClipboardList className="size-5" />} label="Event Registrations" value={number(activeRegistrations.length)} />
        <Metric icon={<CalendarDays className="size-5" />} label="Events Attended" value={number(checkedInEvents.length)} />
        <Metric icon={<PackageCheck className="size-5" />} label="Samples Claimed" value={number(samplesClaimed)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="tap-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-ink">My Event Status</h2>
            <Link className="text-sm font-black text-cyan-700" href="/creator/events">View all</Link>
          </div>
          <div className="mt-4 grid gap-3">
            {overview.registrations.slice(0, 4).map(({ registration, event, attendance }) => (
              <article key={registration.id} className="rounded-lg bg-slate-50 p-4">
                <p className="font-black text-ink">{event.event_name}</p>
                <p className="mt-1 text-sm text-slate-500">{shortDate(event.event_date)} - {event.venue}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`status-pill ${registrationStatusClass(registration.registration_status)}`}>{registration.registration_status}</span>
                  <span className="status-pill bg-slate-100 text-slate-700">{attendance?.status || "not_checked_in"}</span>
                </div>
              </article>
            ))}
            {!overview.registrations.length ? <EmptyState text="No event registrations are linked to your profile yet." /> : null}
          </div>
        </section>

        <section className="tap-card p-5">
          <h2 className="text-xl font-black text-ink">Available Campaigns</h2>
          <EmptyState text="Affiliate campaigns will appear here once TAP publishes creator opportunities." />
          <Link className="tap-button tap-button-primary mt-4 w-full" href="/creator/campaigns">Browse Campaigns</Link>
        </section>
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="tap-card p-4">
      <div className="mb-3 text-cyan-700">{icon}</div>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-200 p-5 text-sm font-bold text-slate-500">{text}</div>;
}
