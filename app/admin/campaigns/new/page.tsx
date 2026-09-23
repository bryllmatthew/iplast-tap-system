import Link from "next/link";

import { CampaignForm } from "@/components/CampaignForm";
import { listCampaignBrandOptions } from "@/lib/repository";

export default async function NewCampaignPage({
  searchParams
}: {
  searchParams: Promise<{ campaignMessage?: string; campaignResult?: string }>;
}) {
  const query = await searchParams;
  const brandOptions = await listCampaignBrandOptions();

  return (
    <section className="tap-card p-5">
      <Link className="text-sm font-bold text-cyan-700" href="/admin/campaigns">
        Back to campaigns
      </Link>
      <div className="mt-4">
        <h1 className="text-3xl font-black text-ink">Create Campaign</h1>
        <p className="mt-2 text-slate-600">Add affiliate campaign details for creators to review and apply.</p>
      </div>
      {query.campaignMessage ? (
        <div className={`mt-4 rounded-lg border p-3 text-sm font-bold ${query.campaignResult === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {query.campaignMessage}
        </div>
      ) : null}
      <div className="mt-6">
        <CampaignForm brandOptions={brandOptions} />
      </div>
    </section>
  );
}
