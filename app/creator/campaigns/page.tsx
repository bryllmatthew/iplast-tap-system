import Link from "next/link";

import { requireAuth } from "@/lib/auth";
import { number } from "@/lib/format";
import { listCreatorCampaigns } from "@/lib/repository";

export default async function CreatorCampaignsPage() {
  const user = await requireAuth("creator");
  const rows = await listCreatorCampaigns(user.id);
  const approvedRows = rows.filter(({ application }) => application?.status === "approved");
  const availableRows = rows.filter(({ application }) => application?.status !== "approved");

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <h1 className="text-3xl font-black text-ink">Campaigns</h1>
        <p className="mt-2 text-slate-600">Track approved campaigns and browse affiliate campaigns open for applications.</p>
      </div>

      <CampaignSection title="Approved Campaigns" empty="No approved campaigns yet. Once TAP approves your application, it will appear here.">
        {approvedRows.map((row) => <CampaignCard key={row.campaign.id} row={row} />)}
      </CampaignSection>

      <CampaignSection title="Available Campaigns" empty="No other recruiting campaigns are available yet.">
        {availableRows.map((row) => <CampaignCard key={row.campaign.id} row={row} />)}
      </CampaignSection>
    </section>
  );
}

function CampaignSection({
  title,
  empty,
  children
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasChildren = Boolean(children && (!Array.isArray(children) || children.length));

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-xl font-black text-ink">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {hasChildren ? children : <div className="tap-card p-8 text-center text-slate-500 md:col-span-2">{empty}</div>}
      </div>
    </section>
  );
}

function CampaignCard({
  row
}: {
  row: Awaited<ReturnType<typeof listCreatorCampaigns>>[number];
}) {
  const { campaign, brand, seller, application } = row;
  const isApproved = application?.status === "approved";

  return (
    <Link className="campaign-card tap-card block p-5 hover:border-cyan-400" href={`/creator/campaigns/${campaign.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="campaign-card-accent text-sm font-black uppercase text-cyan-700">{brand?.brand_name || "Brand Campaign"}</p>
          <h3 className="campaign-card-title mt-2 text-xl font-black text-ink">{campaign.campaign_name}</h3>
          <p className="campaign-card-meta mt-1 text-sm text-slate-500">{seller?.company_name || "TAP Campaign"}</p>
        </div>
        <span className="status-pill bg-cyan-50 text-cyan-700">{application?.status || campaign.status}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Info label="Open Plan Commission" value={`${number(campaign.open_plan_commission)}%`} />
        <Info label="Campaign Access" value={isApproved ? "Approved" : application ? "Awaiting approval" : "Open to apply"} />
      </div>
      <p className="campaign-card-meta mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{campaign.campaign_mechanics || "Campaign overview will be shared here."}</p>
    </Link>
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
