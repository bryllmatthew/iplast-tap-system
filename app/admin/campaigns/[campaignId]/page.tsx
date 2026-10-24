import Link from "next/link";
import { notFound } from "next/navigation";

import { reviewCampaignOutputAction, updateCampaignApplicationStatusAction } from "@/app/actions";
import { CampaignForm } from "@/components/CampaignForm";
import { number, time } from "@/lib/format";
import { getCampaignDetail, listCampaignBrandOptions } from "@/lib/repository";
import type { CampaignApplication } from "@/lib/types";
import { campaignApplicationStatusClass, campaignOutputStatusClass, campaignStatusClass } from "@/lib/status";

export default async function AdminCampaignDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ campaignMessage?: string; campaignResult?: string; appMessage?: string; appResult?: string; edit?: string }>;
}) {
  const { campaignId } = await params;
  const query = await searchParams;
  const [detail, brandOptions] = await Promise.all([getCampaignDetail(campaignId), listCampaignBrandOptions()]);
  if (!detail) notFound();
  const isEditing = query.edit === "1";
  const approvedApplications = detail.applications.filter((application) => application.status === "approved").length;

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
          <div className="flex flex-wrap gap-2">
            <span className={`status-pill ${campaignStatusClass(detail.campaign.status)}`}>{detail.campaign.status}</span>
            <Link className="tap-button tap-button-primary" href={`/admin/campaigns/${detail.campaign.id}?edit=1`}>
              Edit Campaign
            </Link>
          </div>
        </div>
        {query.campaignMessage ? (
          <div className={`mt-4 rounded-lg border p-3 text-sm font-bold ${query.campaignResult === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {query.campaignMessage}
          </div>
        ) : null}
        {query.appMessage ? (
          <div className={`mt-4 rounded-lg border p-3 text-sm font-bold ${query.appResult === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {query.appMessage}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Info label="Open Plan Commission" value={`${number(detail.campaign.open_plan_commission)}%`} />
        <Info label="Applications" value={`${number(detail.applications.length)} total`} />
        <Info label="Approved Creators" value={number(approvedApplications)} />
      </div>

      {isEditing ? (
        <section className="tap-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-ink">Edit Campaign</h2>
              <p className="mt-2 text-sm text-slate-600">Campaign details can be updated even after publishing.</p>
            </div>
            <Link className="tap-button tap-button-secondary" href={`/admin/campaigns/${detail.campaign.id}`}>
              Hide Editor
            </Link>
          </div>
          <div className="mt-5">
            <CampaignForm campaign={detail.campaign} brandOptions={brandOptions} />
          </div>
        </section>
      ) : (
        <section className="tap-card p-5">
          <h2 className="text-xl font-black text-ink">Campaign Overview</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <TextBlock title="Campaign Mechanics and Guidelines" text={detail.campaign.campaign_mechanics} />
            <TextBlock title="Campaign Requirements" text={detail.campaign.campaign_requirements} />
            <ExternalLink label="Campaign Assets" href={detail.campaign.campaign_assets_url} />
            <ExternalLink label="Campaign Product Link" href={detail.campaign.campaign_product_link} />
            <div className="lg:col-span-2">
              <h3 className="text-sm font-black uppercase text-slate-400">Sample Videos</h3>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {detail.campaign.sample_video_links.length
                  ? detail.campaign.sample_video_links.map((link) => <ExternalLink key={link} label={link} href={link} />)
                  : <p className="rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-500">No sample video links added.</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="tap-card overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-black text-ink">Creator Applications</h2>
          <p className="mt-2 text-sm text-slate-600">Review creator details, application notes, and campaign approval status.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {detail.applicationRows.map(({ application, creator, output, posting }) => (
            <div key={application.id} className="grid gap-4 p-4 xl:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                {creator ? (
                  <Link className="text-lg font-black text-ink hover:text-cyan-700" href={`/admin/creators/${creator.id}`}>
                    {creator.full_name}
                  </Link>
                ) : (
                  <p className="text-lg font-black text-ink">Unknown creator</p>
                )}
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm font-bold text-slate-500">
                  {creator?.tiktok_username ? <span>@{creator.tiktok_username}</span> : null}
                  {creator?.email ? <span>{creator.email}</span> : null}
                  <span>Applied {time(application.applied_at)}</span>
                </div>
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">{application.application_message || "No application message."}</p>
                {application.status === "approved" ? (
                  <div className="mt-3 rounded-lg border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-ink">Final Output</p>
                      <span className={`status-pill ${campaignOutputStatusClass(output?.status || "not_submitted")}`}>{output?.status || "not_submitted"}</span>
                    </div>
                    {output?.final_output_link ? <a className="mt-2 block break-all text-sm font-bold text-cyan-700 underline" href={output.final_output_link} target="_blank" rel="noreferrer">Open submitted output</a> : null}
                    {output?.submission_notes ? <p className="mt-2 text-sm text-slate-500">{output.submission_notes}</p> : null}
                    {output && output.status !== "approved" ? (
                      <form action={reviewCampaignOutputAction} className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
                        <input type="hidden" name="output_id" value={output.id} />
                        <input type="hidden" name="campaign_id" value={detail.campaign.id} />
                        <input className="tap-input" name="review_notes" placeholder="Feedback for creator" defaultValue={output.review_notes} />
                        <button className="tap-button tap-button-primary" type="submit" name="status" value="approved">Approve Output</button>
                        <button className="tap-button tap-button-danger" type="submit" name="status" value="changes_requested">Request Changes</button>
                      </form>
                    ) : null}
                    {posting ? <a className="mt-3 block break-all text-sm font-bold text-green-700 underline" href={posting.posted_video_link} target="_blank" rel="noreferrer">Published video link</a> : null}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap items-start gap-2 xl:justify-end">
                <span className={`status-pill ${campaignApplicationStatusClass(application.status)}`}>{application.status}</span>
                <ApplicationStatusButton application={application} campaignId={detail.campaign.id} status="under_review" label="Review" />
                <ApplicationStatusButton application={application} campaignId={detail.campaign.id} status="approved" label="Approve" />
                <ApplicationStatusButton application={application} campaignId={detail.campaign.id} status="waitlisted" label="Waitlist" />
                <ApplicationStatusButton application={application} campaignId={detail.campaign.id} status="rejected" label="Reject" tone="danger" />
              </div>
            </div>
          ))}
          {!detail.applications.length ? <div className="p-8 text-center text-slate-500">No creator applications yet.</div> : null}
        </div>
      </section>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="tap-card p-4">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase text-slate-400">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{text || "-"}</p>
    </div>
  );
}

function ExternalLink({ label, href }: { label: string; href?: string }) {
  if (!href) return <p className="rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-500">{label}: not added</p>;
  return (
    <a className="break-all rounded-lg bg-slate-50 p-3 text-sm font-bold text-cyan-700 underline" href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

function ApplicationStatusButton({
  application,
  campaignId,
  status,
  label,
  tone = "secondary"
}: {
  application: CampaignApplication;
  campaignId: string;
  status: CampaignApplication["status"];
  label: string;
  tone?: "secondary" | "danger";
}) {
  return (
    <form action={updateCampaignApplicationStatusAction}>
      <input type="hidden" name="application_id" value={application.id} />
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="status" value={status} />
      <button className={`tap-button ${tone === "danger" ? "tap-button-danger" : status === "approved" ? "tap-button-primary" : "tap-button-secondary"}`} type="submit" disabled={application.status === status}>
        {label}
      </button>
    </form>
  );
}
