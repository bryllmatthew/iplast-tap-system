import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { issueSampleClaimAction } from "@/app/actions";
import { QrScanner } from "@/components/QrScanner";
import { SampleClaimSelector } from "@/components/SampleClaimSelector";
import { currency, number } from "@/lib/format";
import { listSellerDashboard, validateQrForSeller } from "@/lib/repository";

export default async function SellerScanPage({
  params,
  searchParams
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ token?: string; result?: string; message?: string }>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const dashboard = await listSellerDashboard(eventId);
  const validation = query.token ? await validateQrForSeller(eventId, query.token) : null;
  const verified = validation?.ok ? validation.data : undefined;
  const invalidValidation = validation && !validation.ok ? validation : undefined;

  return (
    <section className="space-y-5">
      <div className="tap-card p-4 lg:hidden">
        <p className="mb-3 text-sm font-black uppercase text-cyan-700">Scan Creator QR</p>
        <QrScanner eventId={eventId} />
      </div>

      <div className="tap-card p-5">
        <h1 className="text-3xl font-black text-ink">Scan Creator QR</h1>
        <p className="mt-2 text-slate-600">Open the camera, point at the creator QR, then choose a product to issue.</p>
      </div>

      {query.message ? (
        <div
          className={`rounded-lg border p-4 font-bold ${
            query.result === "claimed"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {query.result === "claimed" ? <CheckCircle2 className="mr-2 inline size-5" /> : <AlertTriangle className="mr-2 inline size-5" />}
          {query.message}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="tap-card hidden p-5 lg:block">
          <p className="mb-3 text-sm font-black uppercase text-cyan-700">Fast Mobile Scan</p>
          <QrScanner eventId={eventId} />
        </div>

        <div className="tap-card p-5">
          {!query.token ? (
            <div className="grid min-h-96 place-items-center text-center text-slate-500">
              Scan a creator QR to verify eligibility.
            </div>
          ) : !verified ? (
            <div className="grid min-h-96 place-items-center text-center">
              <div className="max-w-sm">
                <AlertTriangle className="mx-auto size-12 text-amber-600" />
                <h2 className="mt-3 text-2xl font-black text-ink">
                  {invalidValidation?.code === "pending_approval"
                    ? "Pending Approval"
                    : invalidValidation?.code === "not_checked_in"
                      ? "Check-In Required"
                      : "QR Not Eligible"}
                </h2>
                <p className="mt-2 text-slate-600">{invalidValidation?.message || "This token cannot be used for sample claims."}</p>
                {invalidValidation?.creator ? (
                  <div className="mt-5 rounded-lg bg-slate-50 p-4 text-left">
                    <p className="font-black text-ink">{invalidValidation.creator.full_name}</p>
                    <p className="text-sm font-bold text-slate-500">@{invalidValidation.creator.tiktok_username}</p>
                    <p className="mt-2 text-sm text-slate-500">Registration: {invalidValidation.registration?.registration_status || "unknown"}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-black uppercase text-green-700">Creator Verified</p>
                <h2 className="mt-2 text-3xl font-black text-ink">{verified.creator.full_name}</h2>
                <p className="font-bold text-slate-600">@{verified.creator.tiktok_username}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Info label="GMV Max" value={currency(verified.creator.gmv_max_total)} />
                  <Info label="Followers" value={number(verified.creator.follower_count)} />
                  <Info label="Category" value={verified.creator.creator_category} />
                </div>
              </div>

              <SampleClaimSelector
                eventId={eventId}
                token={query.token}
                brands={dashboard.brands}
                products={dashboard.products}
                eventProducts={dashboard.eventProducts}
                alreadyClaimedProductIds={verified.alreadyClaimedProductIds}
                action={issueSampleClaimAction}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 font-black text-ink">{value}</p>
    </div>
  );
}
