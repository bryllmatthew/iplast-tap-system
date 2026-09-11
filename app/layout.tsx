import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "VisMin Creators Club",
  description: "Creator registration, onsite check-in, QR validation, and sample redemption for VisMin creator events."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200/70 bg-white/85 backdrop-blur">
          <div className="tap-shell flex min-h-16 items-center justify-between gap-4">
            <Link href="/vismincreatorsclub" className="flex items-center gap-3 font-black text-ink">
              <span className="grid size-9 place-items-center rounded-lg bg-ink text-sm text-white">VC</span>
              <span className="hidden sm:inline">VisMin Creators Club</span>
            </Link>
            <nav className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <Link href="/events">Events</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
