import Link from "next/link";

import { createEventAction } from "@/app/actions";
import { RegistrationFieldChecklist } from "@/components/RegistrationFieldChecklist";

export default async function NewEventPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const query = await searchParams;

  return (
    <section className="tap-card p-5">
      <Link className="text-sm font-bold text-cyan-700" href="/admin/events">
        Back to events
      </Link>
      <div className="mt-4">
        <h1 className="text-3xl font-black text-ink">Create Event</h1>
        <p className="mt-2 text-slate-600">Add the event details, event time, and public banner shown on event pages.</p>
      </div>
      {query.message ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 font-bold text-red-700">{query.message}</div>
      ) : null}
      <form action={createEventAction} className="mt-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="tap-label">
            Event Name
            <input className="tap-input" name="event_name" required placeholder="TAP Seller Creator Matchmaking - Cebu" />
          </label>
          <label className="tap-label">
            Event Date
            <input className="tap-input" name="event_date" required type="date" />
          </label>
          <label className="tap-label">
            Location / Venue
            <input className="tap-input" name="venue" required placeholder="SMX Convention Center Cebu" />
          </label>
          <label className="tap-label">
            Address
            <input className="tap-input" name="address" placeholder="Cebu City" />
          </label>
          <fieldset className="grid gap-3 md:col-span-2 md:grid-cols-2">
            <legend className="mb-1 text-sm font-black text-slate-500">Event Time</legend>
            <label className="tap-label">
              Start Time
              <input className="tap-input" name="start_time" type="time" defaultValue="10:00" />
            </label>
            <label className="tap-label">
              End Time
              <input className="tap-input" name="end_time" type="time" defaultValue="17:00" />
            </label>
          </fieldset>
          <label className="tap-label">
            Creator Capacity
            <input className="tap-input" name="maximum_creator_capacity" type="number" min={1} defaultValue={300} />
          </label>
          <label className="tap-label">
            Public Banner
            <input className="tap-input" name="poster" type="file" accept="image/*" />
          </label>
        </div>
        <label className="tap-label">
          Description
          <textarea className="tap-input min-h-28" name="description" placeholder="Short public event description." />
        </label>
        <section className="grid gap-3">
          <div>
            <h2 className="text-xl font-black text-ink">Registration Fields</h2>
            <p className="mt-1 text-sm text-slate-500">Choose the fields creators will see when registering for this event.</p>
          </div>
          <RegistrationFieldChecklist />
        </section>
        <button className="tap-button tap-button-primary w-full md:w-max" type="submit">
          Create Event
        </button>
      </form>
    </section>
  );
}
