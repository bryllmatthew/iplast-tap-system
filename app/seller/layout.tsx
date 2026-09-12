import Link from "next/link";
import { CalendarDays, Home, PackageCheck, QrCode, ReceiptText } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { requireAuth } from "@/lib/auth";
import { listSellerDashboard } from "@/lib/repository";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("seller");
  const dashboard = await listSellerDashboard();
  const eventId = dashboard.event.id;
  const links = [
    ["Dashboard", "/seller", Home],
    ["My Events", "/seller/events", CalendarDays],
    ["Scan", `/seller/events/${eventId}/scan`, QrCode],
    ["Claims", `/seller/events/${eventId}/claims`, ReceiptText],
    ["Products", "/seller/products", PackageCheck]
  ] as const;

  return (
    <main className="tap-shell max-w-5xl pb-24 pt-3 lg:py-5">
      <div className="mb-4 hidden gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 lg:flex">
        <nav className="flex flex-1 gap-2">
          {links.map(([label, href]) => (
            <Link key={href} className="shrink-0 rounded-lg px-3 py-2 text-sm font-black text-slate-600 hover:bg-slate-100" href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button className="tap-button tap-button-secondary" type="submit">
            Logout
          </button>
        </form>
      </div>
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        {links.map(([label, href, Icon]) => (
          <Link key={href} className="grid justify-items-center gap-1 rounded-lg px-1 py-2 text-[0.68rem] font-black text-slate-500" href={href}>
            <Icon className="size-5 text-cyan-700" />
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
