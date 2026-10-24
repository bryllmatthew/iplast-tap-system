import type { EventStatus, RegistrationStatus } from "@/lib/types";

export function registrationStatusClass(status: RegistrationStatus) {
  const classes: Record<RegistrationStatus, string> = {
    approved: "status-approved",
    pending: "status-pending",
    rejected: "status-rejected",
    waitlisted: "status-waitlisted",
    cancelled: "status-neutral"
  };

  return classes[status];
}

export function eventStatusClass(status: EventStatus) {
  const classes: Record<EventStatus, string> = {
    draft: "status-neutral",
    published: "status-info",
    registration_closed: "status-pending",
    ongoing: "status-approved",
    completed: "status-neutral",
    cancelled: "status-rejected"
  };

  return classes[status];
}

export function attendanceStatusClass(status: string) {
  return status === "checked_in" ? "status-approved" : status === "checked_out" ? "status-info" : "status-neutral";
}

export function campaignApplicationStatusClass(status: string) {
  if (status === "approved") return "status-approved";
  if (status === "rejected" || status === "withdrawn") return "status-rejected";
  if (status === "under_review" || status === "waitlisted") return "status-pending";
  return "status-info";
}

export function campaignStatusClass(status: string) {
  if (status === "active") return "status-approved";
  if (status === "completed" || status === "archived") return "status-neutral";
  if (status === "cancelled") return "status-rejected";
  if (status === "recruiting") return "status-info";
  return "status-pending";
}

export function campaignOutputStatusClass(status: string) {
  if (status === "approved") return "status-approved";
  if (status === "changes_requested" || status === "rejected") return "status-rejected";
  if (status === "pending_review") return "status-pending";
  return "status-neutral";
}

export function claimStatusClass(status: string) {
  if (status === "claimed" || status === "issued") return "status-approved";
  if (status === "cancelled" || status === "reversed") return "status-rejected";
  return "status-neutral";
}

export function recordStatusClass(status: string) {
  if (status === "active") return "status-approved";
  if (status === "inactive" || status === "suspended" || status === "revoked") return "status-rejected";
  return "status-neutral";
}

export function qrStatusClass(status: string) {
  if (status === "active") return "status-approved";
  if (status === "revoked") return "status-rejected";
  if (status === "pending_approval") return "status-pending";
  return "status-info";
}
