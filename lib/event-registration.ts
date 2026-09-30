import type { Event } from "@/lib/types";

const eventTimeZone = "Asia/Manila";

export function todayInEventTimeZone(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: eventTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value || "1970";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";

  return `${year}-${month}-${day}`;
}

export function isEventDatePassed(eventDate: string, date = new Date()) {
  return eventDate < todayInEventTimeZone(date);
}

export function isEventRegistrationOpen(event: Event, date = new Date()) {
  if (isEventDatePassed(event.event_date, date)) return false;
  return ["published", "ongoing"].includes(event.status);
}

export function eventRegistrationStatusLabel(event: Event, date = new Date()) {
  if (isEventRegistrationOpen(event, date)) return "Registration open";
  if (isEventDatePassed(event.event_date, date)) return "Registration closed";
  if (event.status === "registration_closed") return "Registration closed";
  if (event.status === "cancelled") return "Cancelled";
  if (event.status === "completed") return "Completed";
  return event.status.replaceAll("_", " ");
}
