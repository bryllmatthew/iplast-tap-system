import { CalendarDays, CheckCircle2, Clock, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import { submitRegistrationAction } from "@/app/actions";
import { isEventRegistrationOpen } from "@/lib/event-registration";
import { registrationFieldPlaceholder } from "@/lib/registration-fields";
import { getEventBySlug, getPublishedForm } from "@/lib/repository";
import { eventTimeRange, shortDate } from "@/lib/format";
import type { FieldType, FormField } from "@/lib/types";

export const dynamic = "force-dynamic";

function displayField(field: FormField) {
  return {
    ...field,
    placeholder: registrationFieldPlaceholder(field.id)
  };
}

function inputType(fieldType: FieldType) {
  if (fieldType === "number") return "number";
  if (fieldType === "email") return "email";
  if (fieldType === "url") return "url";
  if (fieldType === "phone") return "tel";
  if (fieldType === "date") return "date";
  return "text";
}

export default async function RegisterPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ submitted?: string; message?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const registrationOpen = isEventRegistrationOpen(event);
  const form = registrationOpen ? await getPublishedForm(event.id) : null;
  if (registrationOpen && !form) notFound();
  const submitted = query.submitted === "1";

  return (
    <main className="tap-shell grid gap-6 py-8 lg:grid-cols-[0.75fr_1.25fr]">
      <aside className="tap-card h-max overflow-hidden">
        <img className="h-64 w-full object-cover" src={event.poster_url} alt="" />
        <div className="space-y-3 p-5">
          <span className={`status-pill ${registrationOpen ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>
            {registrationOpen ? event.status : "registration_closed"}
          </span>
          <h1 className="text-2xl font-black text-ink">{event.event_name}</h1>
          <div className="grid gap-2 text-sm font-bold text-slate-500">
            <span className="inline-flex items-start gap-2">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-cyan-700" />
              {shortDate(event.event_date)}
            </span>
            <span className="inline-flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-cyan-700" />
              {eventTimeRange(event.start_time, event.end_time)}
            </span>
            <span className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-cyan-700" />
              {event.venue}
            </span>
            {event.address && event.address !== event.venue ? (
              <span className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-cyan-700" />
                {event.address}
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-6 text-slate-500">{event.description}</p>
        </div>
      </aside>

      <section className="tap-card p-5 sm:p-7">
        {!registrationOpen ? (
          <div className="grid min-h-[460px] place-items-center text-center">
            <div className="max-w-md space-y-4">
              <Clock className="mx-auto size-14 text-amber-400" />
              <h2 className="text-3xl font-black text-ink">Registration Closed</h2>
              <p className="leading-7 text-slate-600">
                Registration for this event has closed because the event date has already passed.
              </p>
            </div>
          </div>
        ) : submitted ? (
          <div className="grid min-h-[460px] place-items-center text-center">
            <div className="max-w-md space-y-4">
              <CheckCircle2 className="mx-auto size-14 text-green-600" />
              <h2 className="text-3xl font-black text-ink">Registration received</h2>
              <p className="leading-7 text-slate-600">
                Thank you for registering. Your registration is currently pending approval.
              </p>
            </div>
          </div>
        ) : (
          <form action={submitRegistrationAction.bind(null, event.event_slug)} className="space-y-5">
            <div>
              <h2 className="text-3xl font-black text-ink">Creator Registration</h2>
              <p className="mt-2 text-slate-600">Fields are captured against form version {form!.version_number}.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {form!.fields.map((rawField) => {
                const field = displayField(rawField);
                return (
                <label key={field.id} className={`tap-label ${field.field_type === "long_text" ? "sm:col-span-2" : ""}`}>
                  <span>
                    {field.label}
                    {field.required ? <span className="text-red-400"> *</span> : null}
                  </span>
                  {field.field_type === "long_text" ? (
                    <textarea className="tap-input min-h-28" name={field.id} required={field.required} placeholder={field.placeholder} />
                  ) : field.field_type === "single_select" ? (
                    <select className="tap-input" name={field.id} required={field.required}>
                      <option value="">Select</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.field_type === "multi_select" ? (
                    <input
                      className="tap-input"
                      name={field.id}
                      placeholder={field.placeholder || field.options?.slice(0, 3).join(", ")}
                      required={field.required}
                    />
                  ) : (
                    <input
                      className="tap-input"
                      name={field.id}
                      required={field.required}
                      placeholder={field.placeholder}
                      type={inputType(field.field_type)}
                    />
                  )}
                </label>
                );
              })}
            </div>
            <button className="tap-button tap-button-primary w-full sm:w-auto" type="submit">
              Submit Registration
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
