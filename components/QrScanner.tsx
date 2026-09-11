"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Keyboard, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";

type QrScannerProps = {
  eventId: string;
};

function extractToken(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.at(-1) || trimmed;
  } catch {
    return trimmed;
  }
}

export function QrScanner({ eventId }: QrScannerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [manual, setManual] = useState("");
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "active" | "unsupported" | "error">("idle");

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function openCamera() {
    if (!("BarcodeDetector" in window)) {
      setCameraState("unsupported");
      return;
    }

    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("active");

      const Detector = (window as unknown as { BarcodeDetector: new (options: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
      const detector = new Detector({ formats: ["qr_code"] });

      const scan = async () => {
        if (!videoRef.current || cameraState === "error") return;
        const codes = await detector.detect(videoRef.current).catch(() => []);
        const value = codes[0]?.rawValue;
        if (value) {
          stream.getTracks().forEach((track) => track.stop());
          router.push(`/seller/events/${eventId}/scan?token=${encodeURIComponent(extractToken(value))}`);
          return;
        }
        window.setTimeout(scan, 350);
      };
      window.setTimeout(scan, 500);
    } catch {
      setCameraState("error");
    }
  }

  function submitManual() {
    const token = extractToken(manual);
    if (token) router.push(`/seller/events/${eventId}/scan?token=${encodeURIComponent(token)}`);
  }

  return (
    <div className="grid gap-4">
      <button className="tap-button tap-button-primary min-h-16 w-full text-base" type="button" onClick={openCamera}>
        <Camera className="size-5" />
        Scan QR with Camera
      </button>

      <video
        ref={videoRef}
        className={`aspect-square w-full rounded-lg bg-ink object-cover sm:aspect-video ${cameraState === "active" ? "block" : "hidden"}`}
        muted
        playsInline
      />

      {cameraState === "unsupported" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">
          Camera QR detection is not available in this browser. Enter the QR token or QR URL below.
        </div>
      ) : null}

      {cameraState === "error" ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
          Camera access failed. Check browser permissions or use manual entry.
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="tap-label">
          <span className="inline-flex items-center gap-2">
            <Keyboard className="size-4" />
            Manual QR token or URL
          </span>
          <div className="grid gap-2">
            <input
              className="tap-input"
              value={manual}
              onChange={(event) => setManual(event.target.value)}
              placeholder="tap_demo_juan_2026"
            />
            <button className="tap-button tap-button-secondary min-h-12 w-full" type="button" onClick={submitManual}>
              <ScanLine className="size-4" />
              Verify
            </button>
          </div>
        </label>
      </div>
    </div>
  );
}
