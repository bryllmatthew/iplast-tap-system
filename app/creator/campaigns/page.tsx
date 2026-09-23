import Link from "next/link";

import { requireAuth } from "@/lib/auth";
import { number } from "@/lib/format";
import { listCreatorCampaigns } from "@/lib/repository";

export default async function CreatorCampaignsPage() {
  const user = await requireAuth("creator");
  const rows = await listCreatorCampaigns(user.id);

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <h1 className="text-3xl font-black text-ink">Available Campaigns</h1>
        <p className="mt-2 text-slate-600">Browse affiliate campaigns that are open for creator applications.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map(({ campaign, brand, seller, application }) => (
          <Link key={campaign.id} className="tap-card block p-5 hover:border-cyan-400" href={`/creator/campaigns/${campaign.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase text-cyan-700">{brand?.brand_name || "Brand Campaign"}</p>
                <h2 className="mt-2 text-xl font-black text-ink">{campaign.campaign_name}</h2>
                <p className="mt-1 text-sm text-slate-500">{seller?.company_name || "TAP Campaign"}</p>
              </div>
              <span className="status-pill bg-cyan-50 text-cyan-700">{application?.status || campaign.status}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Open Plan Commission" value={`${number(campaign.open_plan_commission)}%`} />
              <Info label="Assets" value={campaign.campaign_assets_url ? "Available" : "Not added"} />
            </div>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{campaign.campaign_requirements || campaign.campaign_mechanics}</p>
          </Link>
        ))}
        {!rows.length ? (
          <div className="tap-card p-8 text-center text-slate-500 md:col-span-2">
            No recruiting campaigns are available yet.
          </div>
        ) : null}
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
