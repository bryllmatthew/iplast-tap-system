import Link from "next/link";
import { ClipboardList, PackageCheck } from "lucide-react";

import { RemoveSellerEventButton } from "@/components/RemoveSellerEventButton";
import { number } from "@/lib/format";
import { listSellerDashboard } from "@/lib/repository";
import { eventStatusClass } from "@/lib/status";

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
          <span className={`status-pill ${eventStatusClass(dashboard.event.status)}`}>{dashboard.event.status}</span>
          <h1 className="mt-3 text-3xl font-black text-ink">{dashboard.event.event_name}</h1>
          <p className="mt-2 text-slate-600">{dashboard.eventSeller.booth_name} - {dashboard.eventSeller.booth_number}</p>
          <div className="mt-5">
            <RemoveSellerEventButton eventId={eventId} eventName={dashboard.event.event_name} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
