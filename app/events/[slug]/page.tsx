import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

import { getEventBySlug } from "@/lib/repository";
import { eventTimeRange, shortDate } from "@/lib/format";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <main>
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-ink text-white">
        <img className="absolute inset-0 h-full w-full object-cover opacity-30" src="/hero-background.jpg" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#050507]/90 to-[#050507]" />
        <div className="tap-shell relative grid min-h-[calc(100vh-64px)] items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-sm font-bold">
              Registration open
            </div>
            <h1 className="text-4xl font-black tracking-normal sm:text-6xl">{event.event_name}</h1>
            <p className="max-w-2xl text-lg leading-8 text-white/82">{event.description}</p>
            <div className="grid gap-3 text-white/90 sm:grid-cols-2">
              <div className="flex gap-3">
                <Calendar className="size-5 shrink-0 text-tap-cyan" />
                <span>{shortDate(event.event_date)}</span>
              </div>
              <div className="flex gap-3">
                <Clock className="size-5 shrink-0 text-tap-cyan" />
                <span>{eventTimeRange(event.start_time, event.end_time)}</span>
              </div>
              <div className="flex gap-3">
                <MapPin className="size-5 shrink-0 text-tap-cyan" />
                <span>{event.venue}</span>
              </div>
              <div className="flex gap-3">
                <Users className="size-5 shrink-0 text-tap-cyan" />
                <span>{event.maximum_creator_capacity} creator slots</span>
              </div>
            </div>
            <Link className="tap-button bg-white text-ink" href={`/events/${event.event_slug}/register`}>
              Register Now
            </Link>
          </div>
          <div>
            <img
              className="aspect-[4/3] w-full rounded-lg border border-white/15 bg-black/30 object-contain shadow-2xl"
              src={event.poster_url}
              alt={`${event.event_name} banner`}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
