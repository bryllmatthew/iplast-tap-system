import Link from "next/link";
import { CalendarDays, MapPin, ScanLine } from "lucide-react";

import { shortDate } from "@/lib/format";
import { listSellerEvents } from "@/lib/repository";
import { eventStatusClass } from "@/lib/status";

export default async function SellerScanChooserPage() {
  const rows = await listSellerEvents();

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <p className="text-sm font-black uppercase text-cyan-700">Scan</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Choose event to scan</h1>
        <p className="mt-2 text-slate-600">Select the event first, then scan the creator QR and issue samples.</p>
      </div>

      <div className="grid gap-4">
        {rows.map(({ event, eventSeller }) => (
          <article key={event.id} className="tap-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className={`status-pill ${eventStatusClass(event.status)}`}>{event.status}</span>
                <h2 className="mt-3 text-xl font-black text-ink">{event.event_name}</h2>
                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4 text-cyan-700" />
                    {shortDate(event.event_date)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4 text-cyan-700" />
                    {event.venue}
                  </span>
                  <span>{eventSeller.booth_name} - {eventSeller.booth_number}</span>
                </div>
              </div>
              <Link className="tap-button tap-button-primary min-h-12" href={`/seller/events/${event.id}/scan`}>
                <ScanLine className="size-4" />
                Scan This Event
              </Link>
            </div>
          </article>
        ))}
        {!rows.length ? <div className="tap-card p-8 text-center font-bold text-slate-500">No assigned events available for scanning.</div> : null}
      </div>
    </section>
  );
}
