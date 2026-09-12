import { currency, number, time } from "@/lib/format";
import { getAdminOverview, getClaimRows } from "@/lib/repository";

export default async function ReportsPage() {
  const overview = await getAdminOverview();
  const claims = await getClaimRows();

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <h1 className="text-3xl font-black text-ink">Reports</h1>
        <p className="mt-2 text-slate-600">Event, creator, seller, and sample analytics for the current TAP event.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Registered Creators" value={number(overview.registered)} />
        <Metric label="Approved Creators" value={number(overview.approved)} />
        <Metric label="Checked-In Creators" value={number(overview.checkedIn)} />
        <Metric label="Samples Issued" value={number(overview.samplesIssued)} />
      </div>
      <div className="tap-card min-w-0 overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-black text-ink">Sample Claim History</h2>
        </div>
        <div className="grid gap-3 p-4 md:hidden">
          {claims.map(({ claim, creator, brand, product }) => (
            <article key={claim.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-black text-ink">{creator.full_name}</p>
                  <p className="text-sm text-slate-500">@{creator.tiktok_username}</p>
                </div>
                <span className="shrink-0 font-black text-ink">Qty {number(claim.quantity)}</span>
              </div>
              <div className="mt-3 grid gap-1 text-sm text-slate-600">
                <p>{brand.brand_name}</p>
                <p className="font-bold text-ink">{product.product_name}</p>
                <p>GMV: {currency(creator.gmv_max_total)}</p>
                <p>Claimed: {time(claim.claimed_at)}</p>
              </div>
            </article>
          ))}
          {claims.length === 0 ? <div className="p-8 text-center text-slate-500">No sample claims yet.</div> : null}
        </div>
        <div className="hidden max-w-full overflow-x-auto md:block">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-slate-50 text-sm font-black uppercase text-slate-500">
              <tr>
                <th className="p-4">Creator</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Product</th>
                <th className="p-4">GMV</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(({ claim, creator, brand, product }) => (
                <tr key={claim.id} className="border-t border-slate-100">
                  <td className="p-4">
                    <p className="font-black text-ink">{creator.full_name}</p>
                    <p className="text-sm text-slate-500">@{creator.tiktok_username}</p>
                  </td>
                  <td className="p-4 text-slate-600">{brand.brand_name}</td>
                  <td className="p-4 text-slate-600">{product.product_name}</td>
                  <td className="p-4 text-slate-600">{currency(creator.gmv_max_total)}</td>
                  <td className="p-4 font-black text-ink">{claim.quantity}</td>
                  <td className="p-4 text-slate-600">{time(claim.claimed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="tap-card p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}
