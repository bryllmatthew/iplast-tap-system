import Link from "next/link";

const links = [
  ["Dashboard", "/admin"],
  ["Events", "/admin/events"],
  ["Creators", "/admin/creators"],
  ["Reports", "/admin/reports"]
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="tap-shell grid gap-5 py-6 lg:grid-cols-[220px_1fr]">
      <aside className="tap-card h-max p-3">
        <p className="px-3 py-2 text-xs font-black uppercase text-slate-400">TAP Admin</p>
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
