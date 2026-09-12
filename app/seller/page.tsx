import Link from "next/link";
import { PackageCheck, QrCode, ScanLine, Users } from "lucide-react";

import { number } from "@/lib/format";
import { listSellerDashboard } from "@/lib/repository";

export default async function SellerDashboard() {
  const dashboard = await listSellerDashboard();

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <p className="text-sm font-black uppercase text-cyan-700">Seller Portal</p>
        <h1 className="mt-2 text-3xl font-black text-ink">{dashboard.seller.company_name}</h1>
        <p className="mt-2 text-slate-600">Assigned to {dashboard.event.event_name}</p>
        <Link className="tap-button tap-button-primary mt-5 w-full min-h-16 text-base sm:w-auto" href="/seller/events">
          <ScanLine className="size-5" />
          Scan Creator QR
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric href="/seller/claims" icon={<QrCode className="size-5" />} label="Creators Scanned" value={number(dashboard.creatorsScanned)} />
        <Metric href="/seller/claims" icon={<Users className="size-5" />} label="Unique Creators" value={number(dashboard.uniqueCreators)} />
        <Metric href="/seller/claims" icon={<PackageCheck className="size-5" />} label="Samples Issued" value={number(dashboard.samplesIssued)} />
        <Metric href="/seller/products" icon={<PackageCheck className="size-5" />} label="Products Remaining" value={number(dashboard.eventProducts.reduce((total, item) => total + item.available_quantity, 0))} />
      </div>
    </section>
  );
}

function Metric({ href, icon, label, value }: { href: string; icon: React.ReactNode; label: string; value: string }) {
  return (
    <Link className="tap-card block p-5 hover:border-cyan-400" href={href}>
      <div className="mb-4 text-cyan-700">{icon}</div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-ink">{value}</p>
    </Link>
  );
}
