import Link from "next/link";
import { CalendarDays, PackageCheck, Store, Users } from "lucide-react";

import { number } from "@/lib/format";
import { getClaimRows, listCreatorDatabase, listEvents, listSellerDatabaseRows } from "@/lib/repository";

export default async function AdminDashboard() {
  const [events, attendedCreators, sellers, claims] = await Promise.all([
    listEvents(),
    listCreatorDatabase(),
    listSellerDatabaseRows(),
    getClaimRows()
  ]);
  const uniqueCreatorIds = new Set(attendedCreators.map(({ creator }) => creator.id));
  const samplesIssued = claims.reduce((total, { claim }) => total + claim.quantity, 0);

  const cards = [
    { label: "Events", value: number(events.length), Icon: CalendarDays, helper: "Manage event setup and event-level stats", href: "/admin/events", accent: "blue" },
    { label: "Creators", value: number(uniqueCreatorIds.size), Icon: Users, helper: "Checked-in creators database", href: "/admin/creators", accent: "purple" },
    { label: "Sellers", value: number(sellers.length), Icon: Store, helper: "Seller accounts and event assignments", href: "/admin/sellers", accent: "orange" },
    { label: "Samples Issued", value: number(samplesIssued), Icon: PackageCheck, helper: "Total product samples claimed", href: "/admin/reports", accent: "green" }
  ] as const;

  return (
    <div className="space-y-5">
      <section className="tap-card overflow-hidden">
        <div className="p-5">
          <div>
            <p className="text-sm font-black uppercase text-cyan-700">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-black text-ink">System overview</h1>
            <p className="mt-2 max-w-3xl text-slate-600">Track core activity across TAP events, creators, sellers, and product samples.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, Icon, helper, href, accent }) => (
          <Link key={label} className={`tap-card tap-card-accent-${accent} block p-5 hover:border-cyan-400`} href={href}>
            <Icon className="mb-4 size-6 text-cyan-700" />
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black text-ink">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{helper}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
