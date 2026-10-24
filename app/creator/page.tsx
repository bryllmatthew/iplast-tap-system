import Link from "next/link";
import { CalendarDays, ClipboardList, PackageCheck, Store } from "lucide-react";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { number, shortDate } from "@/lib/format";
import { getCreatorPortalOverview, listCreatorCampaigns } from "@/lib/repository";
import { attendanceStatusClass, registrationStatusClass } from "@/lib/status";

export default async function CreatorDashboardPage() {
  const user = await requireAuth("creator");
  const [overview, campaignRows] = await Promise.all([getCreatorPortalOverview(user.id), listCreatorCampaigns(user.id)]);
  if (!overview) redirect("/login?role=creator&next=/creator");

  const activeRegistrations = overview.registrations.filter(({ registration }) => ["pending", "approved", "waitlisted"].includes(registration.registration_status));
  const checkedInEvents = overview.registrations.filter(({ attendance }) => attendance?.status === "checked_in");
  const samplesClaimed = overview.sampleClaims.reduce((total, row) => total + row.claim.quantity, 0);
  const approvedCampaigns = campaignRows.filter(({ application }) => application?.status === "approved");

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <p className="text-sm font-black uppercase text-cyan-700">Welcome back</p>
        <h1 className="mt-2 text-3xl font-black text-ink">{overview.creator.full_name}</h1>
        <p className="mt-2 text-slate-600">Track your TAP event history, sample claims, and upcoming campaign access from here.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric accent="purple" href="/creator/campaigns" icon={<Store className="size-5" />} label="Approved Campaigns" value={number(approvedCampaigns.length)} />
        <Metric accent="blue" href="/creator/events" icon={<ClipboardList className="size-5" />} label="Event Registrations" value={number(activeRegistrations.length)} />
        <Metric accent="green" href="/creator/events" icon={<CalendarDays className="size-5" />} label="Events Attended" value={number(checkedInEvents.length)} />
        <Metric accent="orange" href="/creator/events" icon={<PackageCheck className="size-5" />} label="Samples Claimed" value={number(samplesClaimed)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="tap-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-ink">My Event Status</h2>
            <Link className="text-sm font-black text-cyan-700" href="/creator/events">View all</Link>
          </div>
          <div className="mt-4 grid gap-3">
            {overview.registrations.slice(0, 4).map(({ registration, event, attendance }) => (
              <Link key={registration.id} className="campaign-card block rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-cyan-400" href="/creator/events">
                <p className="font-black text-ink">{event.event_name}</p>
                <p className="mt-1 text-sm text-slate-500">{shortDate(event.event_date)} - {event.venue}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`status-pill ${registrationStatusClass(registration.registration_status)}`}>{registration.registration_status}</span>
                  <span className={`status-pill ${attendanceStatusClass(attendance?.status || "not_checked_in")}`}>{attendance?.status || "not_checked_in"}</span>
                </div>
              </Link>
            ))}
            {!overview.registrations.length ? <EmptyState text="No event registrations are linked to your profile yet." /> : null}
          </div>
        </section>

        <section className="tap-card p-5">
          <h2 className="text-xl font-black text-ink">Available Campaigns</h2>
          <div className="mt-4 grid gap-3">
            {campaignRows.slice(0, 3).map(({ campaign, brand, application }) => (
              <Link key={campaign.id} className="campaign-card block rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-cyan-400" href={`/creator/campaigns/${campaign.id}`}>
                <p className="campaign-card-accent text-xs font-black uppercase text-cyan-700">{brand?.brand_name || "Campaign"}</p>
                <p className="campaign-card-title mt-1 font-black text-ink">{campaign.campaign_name}</p>
                <p className="campaign-card-meta mt-2 text-sm font-bold text-slate-500">{application?.status || campaign.status}</p>
              </Link>
            ))}
            {!campaignRows.length ? <EmptyState text="Affiliate campaigns will appear here once TAP publishes creator opportunities." /> : null}
          </div>
          <Link className="tap-button tap-button-primary mt-4 w-full" href="/creator/campaigns">Browse Campaigns</Link>
        </section>
      </div>
    </section>
  );
}

function Metric({ accent, href, icon, label, value }: { accent: "blue" | "purple" | "green" | "orange"; href: string; icon: React.ReactNode; label: string; value: string }) {
  return (
    <Link className={`tap-card tap-card-accent-${accent} block p-4 hover:border-cyan-400`} href={href}>
      <div className="mb-3 text-cyan-700">{icon}</div>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-ink">{value}</p>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-200 p-5 text-sm font-bold text-slate-500">{text}</div>;
}
