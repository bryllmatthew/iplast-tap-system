import Link from "next/link";
import { Pencil, Search, UserRound } from "lucide-react";

import { sellerPlatformTags } from "@/lib/platform-tags";
import { listSellerDatabaseRows } from "@/lib/repository";
import { recordStatusClass } from "@/lib/status";

export default async function SellersDatabasePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; sellerMessage?: string; sellerResult?: string }>;
}) {
  const { q = "", sellerMessage, sellerResult } = await searchParams;
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
              <input className="tap-input" name="q" placeholder="Seller, brand, username, event" defaultValue={q} />
            </label>
          </form>
        </div>
        {sellerMessage ? (
          <div
            className={`mt-4 rounded-lg border p-3 text-sm font-bold ${
              sellerResult === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {sellerMessage}
          </div>
        ) : null}
      </div>

      <div className="tap-card divide-y divide-slate-100 overflow-hidden">
        {rows.map(({ seller, brands, products, events }) => {
          const tags = sellerPlatformTags(seller, brands, products, events.map((event) => event.event_name));
          return (
          <div key={seller.id} className="seller-db-row flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Link className="seller-db-title truncate font-black text-ink hover:text-white" href={`/admin/sellers/${seller.id}`}>
                  {seller.company_name}
                </Link>
                <span className="seller-db-meta mt-1 flex min-w-0 items-center gap-2 text-sm text-slate-500">
                  <UserRound className="size-4 shrink-0 text-cyan-700" />
                  <span className="truncate">@{seller.username}</span>
                </span>
                {tags.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span key={tag} className="status-pill bg-cyan-50 text-cyan-700">{tag}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={`status-pill ${recordStatusClass(seller.status)}`}>{seller.status}</span>
              <Link className="tap-button tap-button-secondary min-h-10 px-3 text-xs" href={`/admin/sellers/${seller.id}?edit=1`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </div>
          </div>
          );
        })}
        {rows.length === 0 ? <div className="p-8 text-center text-slate-500">No sellers found.</div> : null}
      </div>
    </section>
  );
}
