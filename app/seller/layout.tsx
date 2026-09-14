import Link from "next/link";
import { CalendarDays, Home, PackageCheck, QrCode, ReceiptText } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { AppSidebar } from "@/components/AppSidebar";
import { requireAuth } from "@/lib/auth";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("seller");
  const links = [
    ["Dashboard", "/seller", Home],
    ["My Events", "/seller/events", CalendarDays],
    ["Scan", "/seller/scan", QrCode],
    ["Claims", "/seller/claims", ReceiptText],
    ["Products", "/seller/products", PackageCheck]
  ] as const;

  return (
    <main className="tap-app-shell space-y-5 pb-24 pt-4 lg:py-6">
      <div className="tap-card flex min-h-14 items-center justify-between gap-4 px-4">
        <Link href="/seller" className="font-black text-ink">
          Seller Account
        </Link>
        <form action={logoutAction} className="hidden lg:block">
          <button className="tap-button tap-button-secondary" type="submit">
            Logout
          </button>
        </form>
      </div>
      <div className="flex gap-5">
        <AppSidebar variant="seller" />
        <section className="min-w-0 flex-1">{children}</section>
      </div>
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
