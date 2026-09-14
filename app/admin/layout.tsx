import Link from "next/link";
import { BarChart3, CalendarDays, LayoutDashboard, Store, Users } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { requireAuth } from "@/lib/auth";

const links = [
  ["Dashboard", "/admin"],
  ["Events", "/admin/events"],
  ["Creators", "/admin/creators"],
  ["Sellers", "/admin/sellers"],
  ["Reports", "/admin/reports"]
] as const;

const mobileLinks = [
  ["Home", "/admin", LayoutDashboard],
  ["Events", "/admin/events", CalendarDays],
  ["Creators", "/admin/creators", Users],
  ["Sellers", "/admin/sellers", Store],
  ["Reports", "/admin/reports", BarChart3]
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("admin");

  return (
    <main className="tap-shell grid gap-5 pb-24 pt-4 lg:grid-cols-[220px_1fr] lg:py-6">
      <div className="tap-card col-span-full flex min-h-14 items-center justify-between gap-4 px-4">
        <Link href="/admin" className="font-black text-ink">
          iPlast TAP System
        </Link>
        <div className="flex items-center gap-3">
          <Link className="tap-button tap-button-primary" href="/vismincreatorsclub" target="_blank" rel="noreferrer">
            View Public Page
          </Link>
          <form action={logoutAction} className="hidden lg:block">
            <button className="tap-button tap-button-secondary" type="submit">
              Logout
            </button>
          </form>
        </div>
      </div>
      <aside className="tap-card hidden h-max p-3 lg:block">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <p className="text-xs font-black uppercase text-slate-400">TAP Admin</p>
        </div>
        <nav className="grid gap-1">
          {links.map(([label, href]) => (
            <Link key={href} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-650 hover:bg-slate-100" href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        {mobileLinks.map(([label, href, Icon]) => (
          <Link key={href} className="grid justify-items-center gap-1 rounded-lg px-1 py-2 text-[0.68rem] font-black text-slate-500" href={href}>
            <Icon className="size-5 text-cyan-700" />
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
