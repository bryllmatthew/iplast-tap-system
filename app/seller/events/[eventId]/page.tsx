import Link from "next/link";
import { ClipboardList, PackageCheck, ScanLine } from "lucide-react";

import { number } from "@/lib/format";
import { listSellerDashboard } from "@/lib/repository";

export default async function SellerEventPage({
  params
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const dashboard = await listSellerDashboard(eventId);

  return (
    <section className="space-y-5">
      <div className="tap-card overflow-hidden">
        <img className="h-44 w-full object-cover" src={dashboard.event.poster_url} alt="" />
        <div className="p-5">
          <span className="status-pill bg-green-50 text-green-700">{dashboard.event.status}</span>
          <h1 className="mt-3 text-3xl font-black text-ink">{dashboard.event.event_name}</h1>
          <p className="mt-2 text-slate-600">{dashboard.eventSeller.booth_name} - {dashboard.eventSeller.booth_number}</p>
          <Link className="tap-button tap-button-primary mt-5 w-full min-h-16 sm:w-auto" href={`/seller/events/${eventId}/scan`}>
            <ScanLine className="size-4" />
            Scan Creator QR
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          icon={<ScanLine className="size-5" />}
          title="Scan Creator"
          body="Verify QR eligibility and issue samples."
          href={`/seller/events/${eventId}/scan`}
        />
        <ActionCard
          icon={<ClipboardList className="size-5" />}
          title="Claims"
          body={`${number(dashboard.samplesIssued)} samples issued from this seller portal.`}
          href={`/seller/events/${eventId}/claims`}
        />
        <ActionCard
          icon={<PackageCheck className="size-5" />}
          title="Products"
          body="Manage brands, product samples, and inventory."
          href="/seller/products"
        />
      </div>
    </section>
  );
}

function ActionCard({ icon, title, body, href }: { icon: React.ReactNode; title: string; body: string; href: string }) {
  return (
    <Link className="tap-card block p-5 hover:border-cyan-400" href={href}>
      <div className="mb-4 text-cyan-700">{icon}</div>
      <h2 className="text-xl font-black text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </Link>
  );
}
