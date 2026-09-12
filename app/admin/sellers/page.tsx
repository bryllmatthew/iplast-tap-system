import Link from "next/link";
import { Mail, Search } from "lucide-react";

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

      <div className="tap-card divide-y divide-slate-100 overflow-hidden">
        {rows.map(({ seller }) => (
          <Link key={seller.id} className="block px-4 py-3 hover:bg-slate-50 active:bg-slate-50" href={`/admin/sellers/${seller.id}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-black text-ink">{seller.company_name}</p>
                <span className="mt-1 flex min-w-0 items-center gap-2 text-sm text-slate-500">
                  <Mail className="size-4 shrink-0 text-cyan-700" />
                  <span className="truncate">{seller.email}</span>
                </span>
              </div>
              <span className="status-pill shrink-0 bg-green-50 text-green-700">{seller.status}</span>
            </div>
          </Link>
        ))}
        {rows.length === 0 ? <div className="p-8 text-center text-slate-500">No sellers found.</div> : null}
      </div>
    </section>
  );
}
