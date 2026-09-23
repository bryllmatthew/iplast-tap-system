import Link from "next/link";
import { notFound } from "next/navigation";

import { CampaignForm } from "@/components/CampaignForm";
import { getCampaignDetail, listCampaignBrandOptions } from "@/lib/repository";

export default async function AdminCampaignDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ campaignMessage?: string; campaignResult?: string }>;
}) {
  const { campaignId } = await params;
  const query = await searchParams;
  const [detail, brandOptions] = await Promise.all([getCampaignDetail(campaignId), listCampaignBrandOptions()]);
  if (!detail) notFound();

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <Link className="text-sm font-bold text-cyan-700" href="/admin/campaigns">
          Back to campaigns
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-ink">{detail.campaign.campaign_name}</h1>
            <p className="mt-2 text-slate-600">{detail.brand?.brand_name || "Brand"} - {detail.seller?.company_name || "Seller"}</p>
          </div>
          <span className="status-pill bg-cyan-50 text-cyan-700">{detail.campaign.status}</span>
        </div>
        {query.campaignMessage ? (
          <div className={`mt-4 rounded-lg border p-3 text-sm font-bold ${query.campaignResult === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {query.campaignMessage}
          </div>
        ) : null}
      </div>

      <section className="tap-card p-5">
        <h2 className="text-xl font-black text-ink">Edit Campaign</h2>
        <p className="mt-2 text-sm text-slate-600">Campaign details can be updated even after publishing.</p>
        <div className="mt-5">
          <CampaignForm campaign={detail.campaign} brandOptions={brandOptions} />
        </div>
      </section>

      <section className="tap-card overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-black text-ink">Applications</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {detail.applications.map((application) => (
            <div key={application.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-black text-ink">{application.creator_id}</p>
                <p className="mt-1 text-sm text-slate-500">{application.application_message || "No message."}</p>
              </div>
              <span className="status-pill bg-slate-100 text-slate-700">{application.status}</span>
            </div>
          ))}
          {!detail.applications.length ? <div className="p-8 text-center text-slate-500">No creator applications yet.</div> : null}
        </div>
      </section>
    </section>
  );
}
