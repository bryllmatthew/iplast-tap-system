import type { EventStatus, RegistrationStatus } from "@/lib/types";

export function registrationStatusClass(status: RegistrationStatus) {
  const classes: Record<RegistrationStatus, string> = {
    approved: "bg-green-50 text-green-700",
    pending: "bg-amber-50 text-amber-800",
    rejected: "bg-red-50 text-red-700",
    waitlisted: "bg-cyan-50 text-cyan-800",
    cancelled: "bg-slate-100 text-slate-500"
  };

  return classes[status];
}

export function eventStatusClass(status: EventStatus) {
  const classes: Record<EventStatus, string> = {
    draft: "bg-slate-100 text-slate-500",
    published: "bg-cyan-50 text-cyan-800",
    registration_closed: "bg-amber-50 text-amber-800",
    ongoing: "bg-green-50 text-green-700",
    completed: "bg-slate-100 text-slate-500",
    cancelled: "bg-red-50 text-red-700"
  };

  return classes[status];
}
