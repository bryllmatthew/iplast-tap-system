"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";

type CreatorQrActionsProps = {
  image: string;
  qrUrl: string;
  creatorName: string;
};

export function CreatorQrActions({ image, qrUrl, creatorName }: CreatorQrActionsProps) {
  const [message, setMessage] = useState("");
  const fileName = useMemo(() => `${creatorName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "creator"}-tap-qr.png`, [creatorName]);

  async function copyLink() {
    await navigator.clipboard.writeText(qrUrl);
    setMessage("QR link copied.");
  }

  async function shareQr() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    await navigator.share({
      title: "TAP Event QR",
      text: "My TAP event QR code",
      url: qrUrl
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
        <button className="tap-button tap-button-secondary" type="button" onClick={shareQr}>
          <Share2 className="size-4" />
          Share
        </button>
      </div>
      {message ? <p className="text-center text-sm font-bold text-green-700">{message}</p> : null}
    </div>
  );
}
