"use client";

import { Trash2 } from "lucide-react";

import { removeSellerEventAction } from "@/app/actions";

export function RemoveSellerEventButton({ eventId, eventName }: { eventId: string; eventName: string }) {
  return (
    <form
      action={removeSellerEventAction}
      onSubmit={(event) => {
        if (!window.confirm(`Remove "${eventName}" from your seller account?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="event_id" value={eventId} />
      <button className="tap-button border-red-200 bg-red-50 text-red-700 hover:bg-red-100" type="submit">
        <Trash2 className="size-4" />
        Delete Event
      </button>
    </form>
  );
}
