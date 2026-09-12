import Link from "next/link";
import { BadgeCheck, ClipboardList, PackageCheck, Users } from "lucide-react";

import { number } from "@/lib/format";
import { getAdminOverview, getClaimRows } from "@/lib/repository";

export default async function AdminDashboard() {
  const overview = await getAdminOverview();
  const claims = await getClaimRows();

  const cards = [
    ["Registered", number(overview.registered), ClipboardList, "Creators in the event pipeline", `/admin/events/${overview.event.id}/registrations`],
    ["Approved", number(overview.approved), BadgeCheck, "Ready for onsite check-in", `/admin/events/${overview.event.id}/registrations`],
    ["Checked In", number(overview.checkedIn), Users, `${overview.attendanceRate}% attendance rate`, "/admin/creators"],
    ["Samples Issued", number(overview.samplesIssued), PackageCheck, `${number(overview.remainingSamples)} remaining`, "/admin/reports"]
  ] as const;

  return (
    <div className="space-y-5">
      <section className="tap-card overflow-hidden">
        <div className="p-5">
          <div>
            <p className="text-sm font-black uppercase text-cyan-700">Event Overview</p>
            <h1 className="mt-2 text-3xl font-black text-ink">{overview.event.event_name}</h1>
            <p className="mt-2 max-w-3xl text-slate-600">{overview.event.description}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, helper, href]) => (
          <Link key={label} className="tap-card block p-5 hover:border-cyan-400" href={href}>
            <Icon className="mb-4 size-6 text-cyan-700" />
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black text-ink">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{helper}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Link className="tap-card block p-5 hover:border-cyan-400" href={`/admin/events/${overview.event.id}/sellers`}>
          <h2 className="text-xl font-black text-ink">Seller Metrics</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Metric label="Participating Sellers" value={overview.sellers} />
            <Metric label="Brands" value={overview.brands} />
            <Metric label="Products" value={overview.products} />
          </div>
        </Link>
        <Link className="tap-card block p-5 hover:border-cyan-400" href="/admin/reports">
          <h2 className="text-xl font-black text-ink">Recent Claims</h2>
          <div className="mt-4 space-y-3">
            {claims.slice(0, 3).map(({ claim, creator, product }) => (
              <div key={claim.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
                <div>
                  <p className="font-black text-ink">@{creator.tiktok_username}</p>
                  <p className="text-sm text-slate-500">{product.product_name}</p>
                </div>
                <p className="font-black text-green-700">Qty {number(claim.quantity)}</p>
              </div>
            ))}
          </div>
        </Link>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-ink">{number(value)}</p>
    </div>
  );
}
