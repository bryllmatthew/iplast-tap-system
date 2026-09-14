import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteSellerButton } from "@/components/DeleteSellerButton";
import { number, shortDate, time } from "@/lib/format";
import { getSellerDetail } from "@/lib/repository";

export default async function SellerDetailPage({
  params
}: {
  params: Promise<{ sellerId: string }>;
}) {
  const { sellerId } = await params;
  const detail = await getSellerDetail(sellerId);
  if (!detail) notFound();
  const { seller, brands, products, events, eventSellers, claims, invite } = detail;
  const issued = claims.reduce((total, claim) => total + claim.quantity, 0);

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm font-bold text-cyan-700" href="/admin/sellers">
            Back to sellers
          </Link>
          <DeleteSellerButton sellerId={seller.id} sellerName={seller.company_name} redirectTo="/admin/sellers" />
        </div>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_auto]">
          <div className="flex gap-4">
            {seller.logo_url ? (
              <img className="size-16 rounded-lg border border-slate-200 object-cover" src={seller.logo_url} alt="" />
            ) : (
              <div className="grid size-16 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-2xl font-black text-cyan-700">
                {seller.company_name.slice(0, 1)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black text-ink">{seller.company_name}</h1>
              <p className="mt-1 text-slate-600">{seller.contact_name || "No contact name"}</p>
              <p className="mt-1 text-sm font-bold text-cyan-700">{seller.email}</p>
              {seller.phone ? <p className="mt-1 text-sm text-slate-500">{seller.phone}</p> : null}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <Metric label="Events" value={number(events.length)} />
            <Metric label="Brands" value={number(brands.length)} />
            <Metric label="Products" value={number(products.length)} />
            <Metric label="Samples" value={number(issued)} />
          </div>
        </div>
        {invite ? <p className="mt-4 text-xs font-bold text-slate-500">Login invite: {invite.status} - {invite.email}</p> : null}
      </div>

      <section className="tap-card p-5">
        <h2 className="text-xl font-black text-ink">Assigned Events</h2>
        <div className="mt-4 grid gap-3">
          {eventSellers.map((eventSeller) => {
            const event = events.find((item) => item.id === eventSeller.event_id);
            return (
              <Link key={eventSeller.id} className="rounded-lg bg-slate-50 p-4 hover:border-cyan-400" href={`/admin/events/${eventSeller.event_id}/sellers`}>
                <p className="font-black text-ink">{event?.event_name || "Event"}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {event ? `${shortDate(event.event_date)} - ${event.venue}` : "Event details unavailable"}
                </p>
                <p className="mt-2 text-sm font-bold text-cyan-700">
                  {eventSeller.booth_name || "Booth"} - {eventSeller.booth_number}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="tap-card p-5">
        <h2 className="text-xl font-black text-ink">Brands and Products</h2>
        <div className="mt-4 grid gap-4">
          {brands.map((brand) => {
            const brandProducts = products.filter((product) => product.brand_id === brand.id);
            return (
              <div key={brand.id} className="rounded-lg bg-slate-50 p-4">
                <p className="font-black text-ink">{brand.brand_name}</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {brandProducts.map((product) => (
                    <div key={product.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-bold text-ink">{product.product_name}</p>
                      <p className="mt-1 text-xs text-slate-500">{product.sku || "No SKU"}</p>
                      <p className="mt-2 text-sm text-slate-600">Inventory: {number(product.sample_inventory)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="tap-card overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-black text-ink">Sample Claims</h2>
        </div>
        <div className="grid gap-3 p-4">
          {claims.map((claim) => (
            <div key={claim.id} className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-black text-ink">Qty {claim.quantity}</span> claimed {shortDate(claim.claimed_at)} {time(claim.claimed_at)}
            </div>
          ))}
          {!claims.length ? <div className="p-6 text-center text-slate-500">No sample claims yet.</div> : null}
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
