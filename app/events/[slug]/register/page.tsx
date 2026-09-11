import { CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";

import { submitRegistrationAction } from "@/app/actions";
import { getEventBySlug, getPublishedForm } from "@/lib/repository";
import { shortDate } from "@/lib/format";

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
  const form = await getPublishedForm(event.id);
  if (!form) notFound();
  const submitted = query.submitted === "1";

  return (
    <main className="tap-shell grid gap-6 py-8 lg:grid-cols-[0.75fr_1.25fr]">
      <aside className="tap-card h-max overflow-hidden">
        <img className="h-64 w-full object-cover" src={event.poster_url} alt="" />
        <div className="space-y-3 p-5">
          <span className="status-pill bg-green-50 text-green-700">{event.status}</span>
          <h1 className="text-2xl font-black text-ink">{event.event_name}</h1>
          <p className="text-slate-600">{shortDate(event.event_date)} at {event.venue}</p>
          <p className="text-sm leading-6 text-slate-500">{event.description}</p>
        </div>
      </aside>

      <section className="tap-card p-5 sm:p-7">
        {submitted ? (
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
              <p className="mt-2 text-slate-600">Fields are captured against form version {form.version_number}.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {form.fields.map((field) => (
                <label key={field.id} className={`tap-label ${field.field_type === "long_text" ? "sm:col-span-2" : ""}`}>
                  {field.label}
                  {field.field_type === "long_text" ? (
                    <textarea className="tap-input min-h-28" name={field.id} required={field.required} />
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
                      placeholder={field.options?.slice(0, 3).join(", ")}
                      required={field.required}
                    />
                  ) : (
                    <input
                      className="tap-input"
                      name={field.id}
                      required={field.required}
                      type={field.field_type === "number" ? "number" : field.field_type === "email" ? "email" : "text"}
                    />
                  )}
                </label>
              ))}
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
