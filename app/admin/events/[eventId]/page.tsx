import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ClipboardList, QrCode, Store } from "lucide-react";
import QRCode from "qrcode";

import { updateEventBannerAction, updateEventRegistrationFormAction, updateEventScheduleAction } from "@/app/actions";
import { DeleteEventButton } from "@/components/DeleteEventButton";
import { EventRegistrationQrActions } from "@/components/EventRegistrationQrActions";
import { RegistrationFieldChecklist } from "@/components/RegistrationFieldChecklist";
import { appUrl } from "@/lib/env";
import { eventTimeRange, number, shortDate } from "@/lib/format";
import { getEventById, getPublishedForm, listRegistrations, listSellerDashboard } from "@/lib/repository";
import { eventStatusClass } from "@/lib/status";

export default async function AdminEventHubPage({
  params,
  searchParams
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{
    bannerMessage?: string;
    bannerResult?: string;
    scheduleMessage?: string;
    scheduleResult?: string;
    formMessage?: string;
    formResult?: string;
    editForm?: string;
  }>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const event = await getEventById(eventId);
  if (!event) notFound();
  const registrations = await listRegistrations(eventId);
  const form = await getPublishedForm(eventId);
  const sellerDashboard = await listSellerDashboard();
  const approved = registrations.filter((row) => row.registration.registration_status === "approved").length;
  const checkedIn = registrations.filter((row) => row.attendance?.status === "checked_in").length;
  const showFormEditor = query.editForm === "1";
  const registrationUrl = appUrl(`/events/${event.event_slug}/register`);
  const registrationQrImage = await QRCode.toDataURL(registrationUrl, { margin: 1, width: 420 });

  return (
    <section className="space-y-5">
      <div className="tap-card overflow-hidden">
        <img className="h-56 w-full object-cover" src={event.poster_url} alt="" />
        <div className="p-5">
          <span className={`status-pill ${eventStatusClass(event.status)}`}>{event.status}</span>
          <h1 className="mt-3 text-3xl font-black text-ink">{event.event_name}</h1>
          <p className="mt-2 text-slate-600">
            {shortDate(event.event_date)} at {eventTimeRange(event.start_time, event.end_time)} - {event.venue}
          </p>
          <p className="mt-2 max-w-3xl text-slate-600">{event.description}</p>
          <form action={updateEventScheduleAction} className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <input type="hidden" name="event_id" value={event.id} />
            <label className="tap-label">
              Event Date
              <input className="tap-input" name="event_date" required type="date" defaultValue={event.event_date} />
            </label>
            <label className="tap-label">
              Start Time
              <input className="tap-input" name="start_time" required type="time" defaultValue={event.start_time} />
            </label>
            <label className="tap-label">
              End Time
              <input className="tap-input" name="end_time" required type="time" defaultValue={event.end_time} />
            </label>
            <button className="tap-button tap-button-secondary" type="submit">
              Update Schedule
            </button>
          </form>
          {query.scheduleMessage ? (
            <div
              className={`mt-3 rounded-lg border p-3 text-sm font-bold ${
                query.scheduleResult === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {query.scheduleMessage}
            </div>
          ) : null}
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
          <div className="mt-5 border-t border-slate-200 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-ink">Danger Zone</p>
                <p className="mt-1 text-sm text-slate-500">Delete this event and its event-specific records from Supabase.</p>
              </div>
              <DeleteEventButton eventId={event.id} eventName={event.event_name} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<ClipboardList className="size-4" />} label="Registrants" value={number(registrations.length)} />
        <Metric icon={<BadgeCheck className="size-4" />} label="Approved" value={number(approved)} />
        <Metric icon={<QrCode className="size-4" />} label="Checked In" value={number(checkedIn)} />
        <Metric icon={<Store className="size-4" />} label="Products" value={number(sellerDashboard.products.length)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="tap-card p-5 md:col-span-2">
          <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:items-center">
            <div className="rounded-lg bg-white p-3 shadow-inner">
              <img className="mx-auto size-56 max-w-full" src={registrationQrImage} alt="Event registration QR code" />
            </div>
            <div>
              <p className="text-sm font-black uppercase text-cyan-700">Registration QR</p>
              <h2 className="mt-2 text-xl font-black text-ink">Use this QR for Facebook posts</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This QR sends creators directly to the registration form for this event.
              </p>
              <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-600">{registrationUrl}</p>
              <div className="mt-4">
                <EventRegistrationQrActions
                  image={registrationQrImage}
                  registrationUrl={registrationUrl}
                  eventName={event.event_name}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="tap-card p-5 md:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-cyan-700">Registration Form</p>
              <h2 className="mt-2 text-xl font-black text-ink">Event registration fields</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Version {form?.version_number || 1} is active with {form?.fields.length || 0} fields.
              </p>
            </div>
            <Link className="tap-button tap-button-primary" href={`/admin/events/${event.id}?editForm=1`}>
              Edit Registration Form
            </Link>
          </div>
          {query.formMessage ? (
            <div
              className={`mt-4 rounded-lg border p-3 text-sm font-bold ${
                query.formResult === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {query.formMessage}
            </div>
          ) : null}
          {showFormEditor ? (
            <form action={updateEventRegistrationFormAction} className="mt-5 grid gap-4 border-t border-slate-200 pt-5">
              <input type="hidden" name="event_id" value={event.id} />
              <p className="text-sm leading-6 text-slate-600">
                Updating this publishes a new form version for future registrations. Existing submitted responses keep their original snapshot.
              </p>
              <RegistrationFieldChecklist selectedFields={form?.fields} />
              <div className="flex flex-wrap gap-2">
                <button className="tap-button tap-button-primary w-full md:w-max" type="submit">
                  Save Registration Fields
                </button>
                <Link className="tap-button tap-button-secondary w-full md:w-max" href={`/admin/events/${event.id}`}>
                  Cancel
                </Link>
              </div>
            </form>
          ) : null}
        </section>

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
