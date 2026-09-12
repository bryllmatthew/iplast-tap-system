"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/seller")) return null;

  return (
    <header className="border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="tap-shell flex min-h-16 items-center justify-between gap-4">
        <Link href="/vismincreatorsclub" className="font-black text-ink">
          VisMin Creators Club
        </Link>
        <nav className="flex items-center gap-3 text-sm font-bold text-slate-600">
          <Link href="/events">Events</Link>
        </nav>
      </div>
    </header>
  );
}
