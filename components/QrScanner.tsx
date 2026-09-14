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
  const scannerId = useRef(`tap-qr-scanner-${Math.random().toString(36).slice(2)}`);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const [manual, setManual] = useState("");
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "active" | "unsupported" | "error">("idle");

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => undefined);
      try {
        scannerRef.current?.clear();
      } catch {
        // Ignore scanner cleanup errors on unmount.
      }
    };
  }, []);

  async function openCamera() {
    setCameraState("starting");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      await scannerRef.current?.stop().catch(() => undefined);
      scannerRef.current?.clear();

      const scanner = new Html5Qrcode(scannerId.current, { verbose: false });
      scannerRef.current = scanner;
      setCameraState("active");
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (value) => {
          await scanner.stop().catch(() => undefined);
          scanner.clear();
          router.push(`/seller/events/${eventId}/scan?token=${encodeURIComponent(extractToken(value))}`);
        },
        () => undefined
      );
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (message.includes("notfound") || message.includes("not supported")) {
        setCameraState("unsupported");
      } else {
        setCameraState("error");
      }
      try {
        scannerRef.current?.clear();
      } catch {
        // Ignore scanner cleanup errors after failed camera start.
      }
    }
  }

  async function stopCamera() {
    await scannerRef.current?.stop().catch(() => undefined);
    scannerRef.current?.clear();
    setCameraState("idle");
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

      <div className={`overflow-hidden rounded-lg bg-ink ${cameraState === "active" || cameraState === "starting" ? "block" : "hidden"}`}>
        <div id={scannerId.current} className="min-h-72 w-full [&_video]:!w-full [&_video]:rounded-lg" />
        {cameraState === "active" ? (
          <button className="tap-button tap-button-secondary m-3 min-h-10 w-[calc(100%-1.5rem)]" type="button" onClick={stopCamera}>
            Stop Camera
          </button>
        ) : null}
      </div>

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
