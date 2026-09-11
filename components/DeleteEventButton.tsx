"use client";

import { Trash2 } from "lucide-react";

import { deleteEventAction } from "@/app/actions";

export function DeleteEventButton({ eventId, eventName }: { eventId: string; eventName: string }) {
  return (
    <form
      action={deleteEventAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete "${eventName}"? This will remove this event, its registrations, check-ins, QR codes, seller assignments, product inventory, and claims.`
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="event_id" value={eventId} />
      <button className="tap-button tap-button-danger" type="submit">
        <Trash2 className="size-4" />
        Delete Event
      </button>
    </form>
  );
}
