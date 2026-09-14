"use client";

import { Trash2 } from "lucide-react";

import { deleteSellerAction } from "@/app/actions";

export function DeleteSellerButton({
  sellerId,
  sellerName,
  eventId,
  redirectTo,
  compact = false
}: {
  sellerId: string;
  sellerName: string;
  eventId?: string;
  redirectTo: string;
  compact?: boolean;
}) {
  return (
    <form
      action={deleteSellerAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete "${sellerName}"? This will remove the seller, event assignments, brands, products, inventory, claims, and queued login details.`
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="seller_id" value={sellerId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      {eventId ? <input type="hidden" name="event_id" value={eventId} /> : null}
      <button className={`tap-button tap-button-danger ${compact ? "min-h-10 px-3 text-xs" : ""}`} type="submit">
        <Trash2 className="size-4" />
        Delete Seller
      </button>
    </form>
  );
}
