import Link from "next/link";
import { Mail, PackageCheck, Search, Store, Ticket } from "lucide-react";

import { number } from "@/lib/format";
import { listSellerDatabaseRows } from "@/lib/repository";

export default async function SellersDatabasePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const rows = await listSellerDatabaseRows(q);

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm font-black uppercase text-cyan-700">Sellers Database</p>
            <h1 className="mt-2 text-3xl font-black text-ink">All event sellers</h1>
            <p className="mt-2 text-slate-600">Click a seller to view events, brands, products, and sample history.</p>
          </div>
          <form>
            <label className="tap-label">
              <span className="inline-flex items-center gap-2">
                <Search className="size-4" />
                Search
              </span>
              <input className="tap-input" name="q" placeholder="Seller, brand, email, event" defaultValue={q} />
            </label>
          </form>
        </div>
      </div>

      <div className="grid gap-3">
        {rows.map(({ seller, brands, products, events, claims, invite }) => {
          const issued = claims.reduce((total, claim) => total + claim.quantity, 0);
          return (
            <Link key={seller.id} className="tap-card block p-4 hover:border-cyan-400" href={`/admin/sellers/${seller.id}`}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex gap-4">
                  {seller.logo_url ? (
                    <img className="size-12 rounded-lg border border-slate-200 object-cover" src={seller.logo_url} alt="" />
                  ) : (
                    <div className="grid size-12 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-lg font-black text-cyan-700">
                      {seller.company_name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-ink">{seller.company_name}</h2>
                      <span className="status-pill bg-green-50 text-green-700">{seller.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{seller.contact_name || "No contact name"}</p>
                    <span className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-cyan-700">
                      <Mail className="size-4" />
                      {seller.email}
                    </span>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-4 lg:min-w-[560px]">
                  <Metric icon={<Ticket className="size-4" />} label="Events" value={number(events.length)} />
                  <Metric icon={<Store className="size-4" />} label="Brands" value={number(brands.length)} />
                  <Metric icon={<PackageCheck className="size-4" />} label="Products" value={number(products.length)} />
                  <Metric icon={<PackageCheck className="size-4" />} label="Samples" value={number(issued)} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {events.slice(0, 3).map((event) => (
                  <span key={event.id} className="status-pill bg-cyan-50 text-cyan-700">
                    {event.event_name}
                  </span>
                ))}
                {brands.slice(0, 4).map((brand) => (
                  <span key={brand.id} className="status-pill bg-green-50 text-green-700">
                    {brand.brand_name}
                  </span>
                ))}
                {invite ? <span className="status-pill bg-slate-50 text-slate-500">Invite {invite.status}</span> : null}
              </div>
            </Link>
          );
        })}
        {rows.length === 0 ? <div className="tap-card p-8 text-center text-slate-500">No sellers found.</div> : null}
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="mb-2 text-cyan-700">{icon}</div>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-ink">{value}</p>
    </div>
  );
}
