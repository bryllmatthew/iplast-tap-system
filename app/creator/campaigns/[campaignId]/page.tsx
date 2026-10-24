import Link from "next/link";
import { notFound } from "next/navigation";

import { applyToCampaignAction, submitCampaignOutputAction, submitCampaignPostingAction } from "@/app/actions";
import { requireAuth } from "@/lib/auth";
import { number } from "@/lib/format";
import { getCreatorCampaignDetail } from "@/lib/repository";
import { campaignApplicationStatusClass, campaignStatusClass } from "@/lib/status";

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
  const { campaign, brand, seller, application, output, posting } = detail;
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
          <span className={`status-pill ${application ? campaignApplicationStatusClass(application.status) : campaignStatusClass(campaign.status)}`}>{application?.status || campaign.status}</span>
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

      {isApproved ? (
        <section className="grid gap-5 xl:grid-cols-2">
          <section className="tap-card p-5">
            <h2 className="text-xl font-black text-ink">Final Output Review</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Upload the Google Drive or file link containing your required campaign videos. TAP must approve it before you post.</p>
            {output?.status === "approved" ? (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">Approved. You have the go signal to post.</div>
            ) : null}
            {output?.status === "changes_requested" ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">Changes requested: {output.review_notes || "Please review TAP feedback and resubmit."}</div>
            ) : null}
            <form action={submitCampaignOutputAction} className="mt-4 grid gap-3">
              <input type="hidden" name="campaign_id" value={campaign.id} />
              <label className="tap-label">
                Final Output Link
                <input className="tap-input" name="final_output_link" required type="url" defaultValue={output?.final_output_link || ""} placeholder="https://drive.google.com/..." />
              </label>
              <label className="tap-label">
                Notes for TAP
                <textarea className="tap-input min-h-24" name="submission_notes" defaultValue={output?.submission_notes || ""} placeholder="Tell TAP what is included in the folder." />
              </label>
              <button className="tap-button tap-button-primary" type="submit">Submit Final Output</button>
            </form>
          </section>

          <section className="tap-card p-5">
            <h2 className="text-xl font-black text-ink">Published Video Monitoring</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">After TAP approves your final output, post the published videos and paste the live link here.</p>
            {output?.status !== "approved" ? <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-500">Waiting for final output approval.</div> : null}
            {posting ? <a className="mt-4 block break-all rounded-lg bg-slate-50 p-4 text-sm font-bold text-cyan-700 underline" href={posting.posted_video_link} target="_blank" rel="noreferrer">{posting.posted_video_link}</a> : null}
            <form action={submitCampaignPostingAction} className="mt-4 grid gap-3">
              <input type="hidden" name="campaign_id" value={campaign.id} />
              <label className="tap-label">
                Published Video Link
                <input className="tap-input" name="posted_video_link" required type="url" defaultValue={posting?.posted_video_link || ""} placeholder="https://www.tiktok.com/..." />
              </label>
              <button className="tap-button tap-button-secondary" type="submit" disabled={output?.status !== "approved"}>Save Published Link</button>
            </form>
          </section>
        </section>
      ) : null}
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
