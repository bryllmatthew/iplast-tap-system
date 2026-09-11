import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ClipboardList, QrCode, Store } from "lucide-react";

import { updateEventBannerAction } from "@/app/actions";
import { number, shortDate } from "@/lib/format";
import { getEventById, listRegistrations, listSellerDashboard } from "@/lib/repository";
import { eventStatusClass } from "@/lib/status";

export default async function AdminEventHubPage({
  params,
  searchParams
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ bannerMessage?: string; bannerResult?: string }>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const event = await getEventById(eventId);
  if (!event) notFound();
  const registrations = await listRegistrations(eventId);
  const sellerDashboard = await listSellerDashboard();
  const approved = registrations.filter((row) => row.registration.registration_status === "approved").length;
  const checkedIn = registrations.filter((row) => row.attendance?.status === "checked_in").length;

  return (
    <section className="space-y-5">
      <div className="tap-card overflow-hidden">
        <img className="h-56 w-full object-cover" src={event.poster_url} alt="" />
        <div className="p-5">
          <span className={`status-pill ${eventStatusClass(event.status)}`}>{event.status}</span>
          <h1 className="mt-3 text-3xl font-black text-ink">{event.event_name}</h1>
          <p className="mt-2 text-slate-600">{shortDate(event.event_date)} - {event.venue}</p>
          <p className="mt-2 max-w-3xl text-slate-600">{event.description}</p>
          <form action={updateEventBannerAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <input type="hidden" name="event_id" value={event.id} />
            <label className="tap-label">
              Replace public banner
              <input className="tap-input" name="poster" type="file" accept="image/*" />
            </label>
            <button className="tap-button tap-button-secondary" type="submit">
              Update Banner
            </button>
          </form>
          {query.bannerMessage ? (
            <div
              className={`mt-3 rounded-lg border p-3 text-sm font-bold ${
                query.bannerResult === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {query.bannerMessage}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<ClipboardList className="size-4" />} label="Registrants" value={number(registrations.length)} />
        <Metric icon={<BadgeCheck className="size-4" />} label="Approved" value={number(approved)} />
        <Metric icon={<QrCode className="size-4" />} label="Checked In" value={number(checkedIn)} />
        <Metric icon={<Store className="size-4" />} label="Products" value={number(sellerDashboard.products.length)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ActionCard
          title="Registrations"
          body="Review form submissions, TikTok URLs, QR status, and approval decisions."
          href={`/admin/events/${event.id}/registrations`}
        />
        <ActionCard
          title="Check-In"
          body="Search approved creators onsite, check them in, and activate their QR."
          href={`/admin/events/${event.id}/check-in`}
        />
        <ActionCard title="Event Sellers" body="Manage assigned sellers and booth details." href={`/admin/events/${event.id}/sellers`} />
        <ActionCard title="Event Products" body="Review sample inventory and per-creator claim limits." href={`/admin/events/${event.id}/products`} />
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="tap-card p-4">
      <div className="mb-3 text-cyan-700">{icon}</div>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-ink">{value}</p>
    </div>
  );
}

function ActionCard({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link className="tap-card block p-5 hover:border-cyan-400" href={href}>
      <h2 className="text-xl font-black text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </Link>
  );
}
