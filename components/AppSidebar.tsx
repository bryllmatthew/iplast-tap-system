"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, Home, LayoutDashboard, Megaphone, PackageCheck, QrCode, ReceiptText, Store, UserRound, Users } from "lucide-react";
import { useEffect, useState } from "react";

const adminLinks = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Events", "/admin/events", CalendarDays],
  ["Campaigns", "/admin/campaigns", Megaphone],
  ["Community", "/admin/community", Users],
  ["Creators", "/admin/creators", Users],
  ["Sellers", "/admin/sellers", Store],
  ["Reports", "/admin/reports", BarChart3]
] as const;

const sellerLinks = [
  ["Dashboard", "/seller", Home],
  ["My Events", "/seller/events", CalendarDays],
  ["Scan", "/seller/scan", QrCode],
  ["Claims", "/seller/claims", ReceiptText],
  ["Products", "/seller/products", PackageCheck]
] as const;

const creatorLinks = [
  ["Dashboard", "/creator", Home],
  ["Campaigns", "/creator/campaigns", Store],
  ["Events", "/creator/events", CalendarDays],
  ["Earnings", "/creator/earnings", CircleDollarSign],
  ["Profile", "/creator/profile", UserRound]
] as const;

export function AppSidebar({ variant }: { variant: "admin" | "seller" | "creator" }) {
  const [collapsed, setCollapsed] = useState(false);
  const links = variant === "admin" ? adminLinks : variant === "seller" ? sellerLinks : creatorLinks;
  const label = variant === "admin" ? "TAP Admin" : variant === "seller" ? "Seller Menu" : "Creator Menu";
  const storageKey = `tap-${variant}-sidebar-collapsed`;

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(storageKey, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside className={`tap-card hidden h-max shrink-0 p-3 transition-[width] duration-200 lg:block ${collapsed ? "w-[72px]" : "w-60"}`}>
      <div className={`flex items-center gap-2 px-2 py-2 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed ? <p className="text-xs font-black uppercase text-slate-400">{label}</p> : null}
        <button className="tap-button tap-button-secondary min-h-9 w-9 p-0" type="button" onClick={toggleCollapsed} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>
      <nav className="mt-2 grid gap-1">
        {links.map(([itemLabel, href, Icon]) => (
          <Link
            key={href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-650 hover:bg-slate-100 ${collapsed ? "justify-center" : ""}`}
            href={href}
            title={itemLabel}
          >
            <Icon className="size-4 shrink-0 text-cyan-700" />
            {!collapsed ? <span>{itemLabel}</span> : null}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
