import Link from "next/link";

const links = [
  ["Dashboard", "/seller"],
  ["My Events", "/seller/events"],
  ["Scan Creator", "/seller/events/evt_davao_2026/scan"],
  ["Claims", "/seller/events/evt_davao_2026/claims"],
  ["Products", "/seller/products"]
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="tap-shell max-w-5xl py-5">
      <nav className="mb-4 flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2">
        {links.map(([label, href]) => (
          <Link key={href} className="shrink-0 rounded-lg px-3 py-2 text-sm font-black text-slate-600 hover:bg-slate-100" href={href}>
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </main>
  );
}
