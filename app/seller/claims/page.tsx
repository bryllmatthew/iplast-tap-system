import { Filter } from "lucide-react";

import { number, shortDate, time } from "@/lib/format";
import { getClaimRows, listSellerDashboard } from "@/lib/repository";

export default async function SellerClaimsPage({
  searchParams
}: {
  searchParams: Promise<{ product?: string; creator?: string }>;
}) {
  const query = await searchParams;
  const dashboard = await listSellerDashboard();
  const rows = (await getClaimRows()).filter(({ claim }) => claim.seller_id === dashboard.seller.id);
  const creatorNeedle = (query.creator || "").trim().toLowerCase();
  const filtered = rows.filter(({ creator, product }) => {
    const productMatch = !query.product || product.id === query.product;
    const creatorMatch =
      !creatorNeedle ||
      [creator.full_name, creator.tiktok_username, creator.email, creator.mobile].some((value) =>
        value.toLowerCase().includes(creatorNeedle)
      );
    return productMatch && creatorMatch;
  });

  return (
    <section className="tap-card overflow-hidden">
      <div className="border-b border-slate-200 p-5">
        <h1 className="text-3xl font-black text-ink">Creators Claimed Samples</h1>
        <p className="mt-2 text-slate-600">Review creator claim history across all assigned events.</p>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="tap-label">
            Product
            <select className="tap-input" name="product" defaultValue={query.product || ""}>
              <option value="">All products</option>
              {dashboard.products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </label>
          <label className="tap-label">
            Creator
            <input className="tap-input" name="creator" placeholder="Name, TikTok, email, mobile" defaultValue={query.creator || ""} />
          </label>
          <button className="tap-button tap-button-primary self-end" type="submit">
            <Filter className="size-4" />
            Apply
          </button>
        </form>
      </div>
      <div className="grid gap-3 p-4">
        {filtered.map(({ claim, event, creator, brand, product }) => (
          <article key={claim.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-ink">{creator.full_name}</p>
                <p className="text-sm text-slate-500">@{creator.tiktok_username}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {product.product_name} - {brand.brand_name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {event.event_name} - {shortDate(event.event_date)}
                </p>
              </div>
              <span className="status-pill bg-green-50 text-green-700">{claim.status}</span>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
              <span>Quantity: {number(claim.quantity)}</span>
              <span>Claimed: {time(claim.claimed_at)}</span>
              <span>By: {claim.claimed_by}</span>
            </div>
          </article>
        ))}
        {filtered.length === 0 ? <div className="p-8 text-center text-slate-500">No creator sample claims match the selected filters.</div> : null}
      </div>
    </section>
  );
}
