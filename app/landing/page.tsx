import Link from "next/link";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";

import { listEvents } from "@/lib/repository";
import { shortDate } from "@/lib/format";

export default async function LandingPage() {
  const events = await listEvents();
  const featured = events[0];

  return (
    <main>
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <img className="absolute inset-0 h-full w-full object-cover opacity-45" src="/hero-background.jpg" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/72 to-[#050507]" />
        <div className="tap-shell relative grid min-h-[calc(100vh-64px)] content-center gap-10 py-12">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-800">
              <Sparkles className="size-4" />
              TAP Matchmaking Events
            </div>
            <h1 className="text-4xl font-black tracking-normal text-ink sm:text-6xl">
              Meet sellers. Get verified. Claim samples with your event QR.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Register for upcoming TAP creator-seller events, save your QR after registration, and use it onsite once
              your registration is approved and checked in.
            </p>
            <div className="flex flex-wrap gap-3">
              {featured ? (
                <Link className="tap-button tap-button-primary" href={`/events/${featured.event_slug}/register`}>
                  Register for Featured Event
                </Link>
              ) : null}
              <Link className="tap-button tap-button-secondary" href="/events">
                Check All Events
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {events.slice(0, 3).map((event) => (
              <article key={event.id} className="tap-card overflow-hidden">
                <img className="h-44 w-full object-cover" src={event.poster_url} alt="" />
                <div className="p-4">
                  <h2 className="text-xl font-black text-ink">{event.event_name}</h2>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="size-4 text-cyan-700" />
                      {shortDate(event.event_date)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="size-4 text-cyan-700" />
                      {event.venue}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link className="tap-button tap-button-primary" href={`/events/${event.event_slug}/register`}>
                      Register
                    </Link>
                    <Link className="tap-button tap-button-secondary" href={`/events/${event.event_slug}`}>
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
