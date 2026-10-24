import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";

import { number } from "@/lib/format";
import { listAdminCampaigns } from "@/lib/repository";
import { campaignStatusClass } from "@/lib/status";

export default async function AdminCampaignsPage({
  searchParams
}: {
  searchParams: Promise<{ campaignMessage?: string; campaignResult?: string }>;
}) {
  const query = await searchParams;
  const rows = await listAdminCampaigns();

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-cyan-700">Affiliate Campaigns</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Campaigns</h1>
            <p className="mt-2 text-slate-600">Create brand affiliate campaigns and manage creator applications.</p>
          </div>
          <Link className="tap-button tap-button-primary" href="/admin/campaigns/new">
            <Plus className="size-4" />
            New Campaign
          </Link>
        </div>
        {query.campaignMessage ? (
          <div className={`mt-4 rounded-lg border p-3 text-sm font-bold ${query.campaignResult === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {query.campaignMessage}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4">
        {rows.map(({ campaign, brand, seller, applications }) => (
          <Link key={campaign.id} className="tap-card block p-5 hover:border-cyan-400" href={`/admin/campaigns/${campaign.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-3 text-cyan-700"><Megaphone className="size-5" /></div>
                <h2 className="text-xl font-black text-ink">{campaign.campaign_name}</h2>
                <p className="mt-1 text-sm font-bold text-slate-500">{brand?.brand_name || "Brand"} - {seller?.company_name || "Seller"}</p>
              </div>
              <span className={`status-pill ${campaignStatusClass(campaign.status)}`}>{campaign.status}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Info label="Commission" value={`${number(campaign.open_plan_commission)}%`} />
              <Info label="Applications" value={number(applications.length)} />
              <Info label="Assets" value={campaign.campaign_assets_url ? "Linked" : "Not added"} />
            </div>
          </Link>
        ))}
        {!rows.length ? <div className="tap-card p-8 text-center text-slate-500">No campaigns created yet.</div> : null}
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
