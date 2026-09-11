import Link from "next/link";

import { logoutAction } from "@/app/actions";
import { requireAuth } from "@/lib/auth";

const links = [
  ["Dashboard", "/admin"],
  ["Events", "/admin/events"],
  ["Creators", "/admin/creators"],
  ["Reports", "/admin/reports"]
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("admin");

  return (
    <main className="tap-shell grid gap-5 py-6 lg:grid-cols-[220px_1fr]">
      <aside className="tap-card h-max p-3">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <p className="text-xs font-black uppercase text-slate-400">TAP Admin</p>
          <form action={logoutAction}>
            <button className="text-xs font-black text-cyan-700" type="submit">
              Logout
            </button>
          </form>
        </div>
        <nav className="grid gap-1">
          {links.map(([label, href]) => (
            <Link key={href} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-650 hover:bg-slate-100" href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <section>{children}</section>
    </main>
  );
}
