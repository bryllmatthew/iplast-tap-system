import Link from "next/link";
import { notFound } from "next/navigation";

import { currency, number, shortDate, time } from "@/lib/format";
import { creatorPlatformTags } from "@/lib/platform-tags";
import { getCreatorDetail } from "@/lib/repository";
import { registrationStatusClass } from "@/lib/status";

export default async function CreatorDetailPage({
  params
}: {
  params: Promise<{ creatorId: string }>;
}) {
  const { creatorId } = await params;
  const detail = await getCreatorDetail(creatorId);
  if (!detail) notFound();
  const { creator, registrations, sampleClaims } = detail;
  const attended = registrations.filter((item) => item.attendance?.status === "checked_in");
  const brandsVisited = new Set(sampleClaims.map((item) => item.brand.id)).size;
  const latestResponse = registrations.find((item) => item.response)?.response;
  const platformTags = creatorPlatformTags(latestResponse);
  const latestAnswers = latestResponse?.answers || {};
  const tikTokGmv = Number(latestAnswers.tiktok_last_month_gmv || latestAnswers.gmv_max_total || 0);
  const shopeeGmv = Number(latestAnswers.shopee_last_month_gmv || 0);

  return (
    <section className="space-y-5">
      <div className="tap-card min-w-0 p-5">
        <Link className="text-sm font-bold text-cyan-700" href="/admin/creators">
          Back to creators
        </Link>
        <div className="mt-4 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <h1 className="text-3xl font-black text-ink">{creator.full_name}</h1>
            <p className="mt-1 text-slate-600">@{creator.tiktok_username} - {creator.creator_category}</p>
            <a className="mt-2 inline-flex max-w-full break-all font-bold text-cyan-700 underline" href={creator.tiktok_profile_url} target="_blank" rel="noreferrer">
              TikTok profile
            </a>
            {platformTags.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {platformTags.map((tag) => (
                  <span key={tag} className="status-pill bg-cyan-50 text-cyan-700">{tag}</span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Events Attended" value={number(attended.length)} />
            <Metric label="Brands Visited" value={number(brandsVisited)} />
            <Metric label="Samples Claimed" value={number(sampleClaims.length)} />
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="tap-card min-w-0 p-5">
          <h2 className="text-xl font-black text-ink">Creator Details</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Email" value={creator.email} />
            <Info label="Mobile" value={creator.mobile} />
            <Info label="Location" value={creator.location} />
            <Info label="Followers" value={number(creator.follower_count)} />
            <Info label="TikTok Last Month GMV" value={currency(tikTokGmv)} />
            <Info label="Shopee Last Month GMV" value={currency(shopeeGmv)} />
            <Info label="Content Categories" value={creator.content_categories.join(", ")} />
            <Info label="Affiliate Experience" value={creator.affiliate_experience} />
            <Info label="Notes" value={creator.notes || "-"} />
          </div>
        </section>

        <section className="tap-card min-w-0 p-5">
          <h2 className="text-xl font-black text-ink">Event Participation</h2>
          <div className="mt-4 grid gap-3">
            {registrations.map(({ registration, event, attendance, qr }) => (
              <div key={registration.id} className="min-w-0 rounded-lg bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-ink">{event.event_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{shortDate(event.event_date)} - {event.venue}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`status-pill ${registrationStatusClass(registration.registration_status)}`}>
                      {registration.registration_status}
                    </span>
                    <span className="status-pill bg-green-50 text-green-700">{attendance?.status || "not_checked_in"}</span>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                  <span>Registered: {shortDate(registration.registered_at)}</span>
                  <span>Checked in: {attendance?.checked_in_at ? time(attendance.checked_in_at) : "-"}</span>
                  {qr ? <Link className="font-bold text-cyan-700 underline" href={`/qr/${qr.qr_token}`}>View QR</Link> : <span>QR: -</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="tap-card min-w-0 overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-black text-ink">Sample Claim History</h2>
        </div>
        <div className="grid gap-3 p-4 md:hidden">
          {sampleClaims.map(({ claim, event, seller, brand, product }) => (
            <article key={claim.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-black text-ink">{product.product_name}</p>
                  <p className="text-sm text-slate-500">{brand.brand_name}</p>
                </div>
                <span className="shrink-0 font-black text-ink">Qty {number(claim.quantity)}</span>
              </div>
              <div className="mt-3 grid gap-1 text-sm text-slate-600">
                <p>{event.event_name}</p>
                <p>{seller.company_name}</p>
                <p>{shortDate(claim.claimed_at)} {time(claim.claimed_at)}</p>
              </div>
            </article>
          ))}
          {sampleClaims.length === 0 ? <div className="p-8 text-center text-slate-500">No sample claims yet.</div> : null}
        </div>
        <div className="hidden max-w-full overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="p-4">Event</th>
                <th className="p-4">Seller</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Product</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Claimed</th>
              </tr>
            </thead>
            <tbody>
              {sampleClaims.map(({ claim, event, seller, brand, product }) => (
                <tr key={claim.id} className="border-t border-slate-100">
                  <td className="p-4 text-slate-600">{event.event_name}</td>
                  <td className="p-4 text-slate-600">{seller.company_name}</td>
                  <td className="p-4 text-slate-600">{brand.brand_name}</td>
                  <td className="p-4 font-bold text-ink">{product.product_name}</td>
                  <td className="p-4 text-slate-600">{claim.quantity}</td>
                  <td className="p-4 text-slate-600">{shortDate(claim.claimed_at)} {time(claim.claimed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-ink">{value}</p>
    </div>
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
