import Link from "next/link";
import { BarChart3, CalendarDays, LayoutDashboard, Store, Users } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { AppSidebar } from "@/components/AppSidebar";
import { requireAuth } from "@/lib/auth";

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
    <main className="tap-app-shell space-y-5 pb-24 pt-4 lg:py-6">
      <div className="tap-card flex min-h-14 items-center justify-between gap-4 px-4">
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
      <div className="flex gap-5">
        <AppSidebar variant="admin" />
        <section className="min-w-0 flex-1">{children}</section>
      </div>
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
