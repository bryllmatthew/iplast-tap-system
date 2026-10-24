"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";

type CommunityQrActionsProps = {
  image: string;
  communityUrl: string;
};

export function CommunityQrActions({ image, communityUrl }: CommunityQrActionsProps) {
  const [message, setMessage] = useState("");
  const fileName = useMemo(() => "vismin-creators-club-community-qr.png", []);

  async function copyLink() {
    await navigator.clipboard.writeText(communityUrl);
    setMessage("Community link copied.");
  }

  async function shareLink() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    await navigator.share({
      title: "VisMin Creators Club",
      text: "Join the VisMin Creators Club community.",
      url: communityUrl
    });
  }

  return (
    <div className="mt-5 grid gap-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <a className="tap-button tap-button-primary" href={image} download={fileName}>
          <Download className="size-4" />
          Download QR
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
