import Link from "next/link";
import { notFound } from "next/navigation";

import { applyToCampaignAction } from "@/app/actions";
import { requireAuth } from "@/lib/auth";
import { number } from "@/lib/format";
import { getCreatorCampaignDetail } from "@/lib/repository";

export default async function CreatorCampaignDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ message?: string; result?: string }>;
}) {
  const user = await requireAuth("creator");
  const { campaignId } = await params;
  const query = await searchParams;
  const detail = await getCreatorCampaignDetail(user.id, campaignId);
  if (!detail) notFound();
  const { campaign, brand, seller, application } = detail;
  const isApproved = application?.status === "approved";

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <Link className="text-sm font-bold text-cyan-700" href="/creator/campaigns">
          Back to campaigns
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-cyan-700">{brand?.brand_name || "Brand Campaign"}</p>
            <h1 className="mt-2 text-3xl font-black text-ink">{campaign.campaign_name}</h1>
            <p className="mt-2 text-slate-600">{seller?.company_name || "TAP Campaign"}</p>
          </div>
          <span className="status-pill bg-cyan-50 text-cyan-700">{application?.status || campaign.status}</span>
        </div>
        {query.message ? (
          <div className={`mt-4 rounded-lg border p-3 text-sm font-bold ${query.result === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {query.message}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="tap-card p-5">
          <div className="grid gap-4">
            <Info label="Open Plan Commission" value={`${number(campaign.open_plan_commission)}%`} />
            <TextBlock title="Campaign Mechanics and Guidelines" text={campaign.campaign_mechanics} />
            {isApproved ? (
              <>
                <TextBlock title="Campaign Requirements" text={campaign.campaign_requirements} />
                {campaign.campaign_assets_url ? <ExternalLink label="Campaign Assets" href={campaign.campaign_assets_url} /> : null}
                {campaign.campaign_product_link ? <ExternalLink label="Campaign Product Link" href={campaign.campaign_product_link} /> : null}
                {campaign.sample_video_links.length ? (
                  <div>
                    <h2 className="text-sm font-black uppercase text-slate-400">Sample Videos</h2>
                    <div className="mt-2 grid gap-2">
                      {campaign.sample_video_links.map((link) => (
                        <ExternalLink key={link} label={link} href={link} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
                <h2 className="text-sm font-black uppercase text-cyan-700">Approval Required</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
                  Campaign assets, product links, sample videos, and detailed requirements unlock after TAP approves your application.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="tap-card h-max p-5">
          <h2 className="text-xl font-black text-ink">Apply for Campaign</h2>
          {application ? (
            <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-600">
              You already applied. Current status: {application.status}.
            </p>
          ) : (
            <form action={applyToCampaignAction} className="mt-4 grid gap-3">
              <input type="hidden" name="campaign_id" value={campaign.id} />
              <label className="tap-label">
                Application Message
                <textarea className="tap-input min-h-28" name="application_message" placeholder="Tell TAP why you are a good fit for this campaign." />
              </label>
              <button className="tap-button tap-button-primary" type="submit">
                Apply Now
              </button>
            </form>
          )}
        </aside>
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

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-sm font-black uppercase text-slate-400">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{text || "-"}</p>
    </div>
  );
}

function ExternalLink({ label, href }: { label: string; href: string }) {
  return (
    <a className="break-all rounded-lg bg-slate-50 p-3 text-sm font-bold text-cyan-700 underline" href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}
