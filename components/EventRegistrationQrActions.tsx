"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";

type EventRegistrationQrActionsProps = {
  image: string;
  registrationUrl: string;
  eventName: string;
};

export function EventRegistrationQrActions({ image, registrationUrl, eventName }: EventRegistrationQrActionsProps) {
  const [message, setMessage] = useState("");
  const fileName = useMemo(
    () => `${eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "event"}-registration-qr.png`,
    [eventName]
  );

  async function copyLink() {
    await navigator.clipboard.writeText(registrationUrl);
    setMessage("Registration link copied.");
  }

  async function shareLink() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    await navigator.share({
      title: eventName,
      text: "Register for this creator event.",
      url: registrationUrl
    });
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <a className="tap-button tap-button-primary" href={image} download={fileName}>
          <Download className="size-4" />
          Save QR
        </a>
        <button className="tap-button tap-button-secondary" type="button" onClick={copyLink}>
          <Copy className="size-4" />
          Copy Link
        </button>
        <button className="tap-button tap-button-secondary" type="button" onClick={shareLink}>
          <Share2 className="size-4" />
          Share
        </button>
      </div>
      {message ? <p className="text-sm font-bold text-green-700">{message}</p> : null}
    </div>
  );
}
