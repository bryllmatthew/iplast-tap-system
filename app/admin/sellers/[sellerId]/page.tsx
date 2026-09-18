import Link from "next/link";
import { notFound } from "next/navigation";
import { KeyRound, Pencil, X } from "lucide-react";

import { DeleteSellerButton } from "@/components/DeleteSellerButton";
import { resetSellerPasswordAction, updateSellerAction } from "@/app/actions";
import { number, shortDate, time } from "@/lib/format";
import { getSellerDetail } from "@/lib/repository";
import type { Seller } from "@/lib/types";

export default async function SellerDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ sellerId: string }>;
  searchParams: Promise<{ edit?: string; resetPassword?: string; sellerMessage?: string; sellerResult?: string }>;
}) {
  const { sellerId } = await params;
  const query = await searchParams;
  const detail = await getSellerDetail(sellerId);
  if (!detail) notFound();
  const { seller, brands, products, events, eventSellers, claims, invite } = detail;
  const issued = claims.reduce((total, claim) => total + claim.quantity, 0);

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm font-bold text-cyan-700" href="/admin/sellers">
            Back to sellers
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link className="tap-button tap-button-secondary" href={`/admin/sellers/${seller.id}?resetPassword=1`}>
              <KeyRound className="size-4" />
              Change Password
            </Link>
            <Link className="tap-button tap-button-secondary" href={`/admin/sellers/${seller.id}?edit=1`}>
              <Pencil className="size-4" />
              Edit Seller
            </Link>
            <DeleteSellerButton sellerId={seller.id} sellerName={seller.company_name} redirectTo="/admin/sellers" />
          </div>
        </div>
        {query.sellerMessage ? (
          <div
            className={`mt-4 rounded-lg border p-3 text-sm font-bold ${
              query.sellerResult === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {query.sellerMessage}
          </div>
        ) : null}
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_auto]">
          <div className="flex gap-4">
            {seller.logo_url ? (
              <img className="size-16 rounded-lg border border-slate-200 object-cover" src={seller.logo_url} alt="" />
            ) : (
              <div className="grid size-16 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-2xl font-black text-cyan-700">
                {seller.company_name.slice(0, 1)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black text-ink">{seller.company_name}</h1>
              <p className="mt-1 text-slate-600">{seller.contact_name || "No contact name"}</p>
              <p className="mt-1 text-sm font-bold text-cyan-700">@{seller.username}</p>
              {seller.phone ? <p className="mt-1 text-sm text-slate-500">{seller.phone}</p> : null}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <Metric label="Events" value={number(events.length)} />
            <Metric label="Brands" value={number(brands.length)} />
            <Metric label="Products" value={number(products.length)} />
            <Metric label="Samples" value={number(issued)} />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Shop Code" value={seller.shop_code || "-"} />
          <Metric label="Shop Link" value={seller.shop_link || "-"} />
          <Metric label="Open Plan Commission" value={`${seller.open_plan_commission}%`} />
          <Metric label="TAP Commission" value={`${seller.tap_commission}%`} />
        </div>
        {invite ? <p className="mt-4 text-xs font-bold text-slate-500">Login details: {invite.status} - @{invite.username || seller.username}</p> : null}
      </div>

      <section className="tap-card p-5">
        <h2 className="text-xl font-black text-ink">Assigned Events</h2>
        <div className="mt-4 grid gap-3">
          {eventSellers.map((eventSeller) => {
            const event = events.find((item) => item.id === eventSeller.event_id);
            return (
              <Link key={eventSeller.id} className="seller-db-card block rounded-lg bg-slate-50 p-4" href={`/admin/events/${eventSeller.event_id}/sellers`}>
                <p className="font-black text-ink">{event?.event_name || "Event"}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {event ? `${shortDate(event.event_date)} - ${event.venue}` : "Event details unavailable"}
                </p>
                <p className="mt-2 text-sm font-bold text-cyan-700">
                  {eventSeller.booth_name || "Booth"} - {eventSeller.booth_number}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="tap-card p-5">
        <h2 className="text-xl font-black text-ink">Brands and Products</h2>
        <div className="mt-4 grid gap-4">
          {brands.map((brand) => {
            const brandProducts = products.filter((product) => product.brand_id === brand.id);
            return (
              <div key={brand.id} className="rounded-lg bg-slate-50 p-4">
                <p className="font-black text-ink">{brand.brand_name}</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {brandProducts.map((product) => (
                    <div key={product.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-bold text-ink">{product.product_name}</p>
                      <p className="mt-1 text-xs text-slate-500">{product.pid || product.sku || "No PID"}</p>
                      <p className="mt-2 text-sm text-slate-600">Inventory: {number(product.sample_inventory)}</p>
                      {product.product_link ? (
                        <a className="mt-2 inline-flex text-sm font-bold text-cyan-700 underline" href={product.product_link} target="_blank" rel="noreferrer">
                          Product link
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="tap-card overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-black text-ink">Sample Claims</h2>
        </div>
        <div className="grid gap-3 p-4">
          {claims.map((claim) => (
            <div key={claim.id} className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-black text-ink">Qty {claim.quantity}</span> claimed {shortDate(claim.claimed_at)} {time(claim.claimed_at)}
            </div>
          ))}
          {!claims.length ? <div className="p-6 text-center text-slate-500">No sample claims yet.</div> : null}
        </div>
      </section>
      {query.edit === "1" ? <EditSellerModal seller={seller} /> : null}
      {query.resetPassword === "1" ? <ResetSellerPasswordModal seller={seller} /> : null}
    </section>
  );
}

function ResetSellerPasswordModal({ seller }: { seller: Seller }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="tap-card max-h-[92vh] w-full max-w-lg overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-ink">Change Seller Password</h2>
            <p className="mt-2 text-slate-600">Set a new login password for {seller.company_name}.</p>
          </div>
          <Link className="tap-button tap-button-secondary" href={`/admin/sellers/${seller.id}`} aria-label="Close password form">
            <X className="size-4" />
          </Link>
        </div>

        <form action={resetSellerPasswordAction} className="mt-5 grid gap-4">
          <input type="hidden" name="seller_id" value={seller.id} />
          <label className="tap-label">
            Seller Username
            <input className="tap-input" value={seller.username} readOnly />
          </label>
          <label className="tap-label">
            New Password
            <input className="tap-input" name="password" required type="password" minLength={8} placeholder="At least 8 characters" />
          </label>
          <label className="tap-label">
            Confirm New Password
            <input className="tap-input" name="confirm_password" required type="password" minLength={8} placeholder="Repeat password" />
          </label>
          <button className="tap-button tap-button-primary min-h-12 w-full md:w-max" type="submit">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

function EditSellerModal({ seller }: { seller: Seller }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="tap-card max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-ink">Edit Seller</h2>
            <p className="mt-2 text-slate-600">Update seller account details.</p>
          </div>
          <Link className="tap-button tap-button-secondary" href={`/admin/sellers/${seller.id}`} aria-label="Close edit seller form">
            <X className="size-4" />
          </Link>
        </div>

        <form action={updateSellerAction} className="mt-5 grid gap-4">
          <input type="hidden" name="seller_id" value={seller.id} />
          <input type="hidden" name="redirect_to" value={`/admin/sellers/${seller.id}`} />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="tap-label">
              Seller Name
              <input className="tap-input" name="seller_name" required defaultValue={seller.company_name} />
            </label>
            <label className="tap-label">
              Contact Name
              <input className="tap-input" name="contact_name" defaultValue={seller.contact_name || seller.company_name} />
            </label>
            <label className="tap-label">
              Username
              <input className="tap-input" name="username" required defaultValue={seller.username} />
            </label>
            <label className="tap-label">
              Phone
              <input className="tap-input" name="phone" defaultValue={seller.phone} />
            </label>
            <label className="tap-label">
              Shop Code
              <input className="tap-input" name="shop_code" defaultValue={seller.shop_code || ""} />
            </label>
            <label className="tap-label">
              Shop Link
              <input className="tap-input" name="shop_link" type="url" defaultValue={seller.shop_link || ""} />
            </label>
            <label className="tap-label">
              Open Plan Commission %
              <input className="tap-input" name="open_plan_commission" type="number" min={0} step="0.01" defaultValue={seller.open_plan_commission} />
            </label>
            <label className="tap-label">
              TAP Commission %
              <input className="tap-input" name="tap_commission" type="number" min={0} step="0.01" defaultValue={seller.tap_commission} />
            </label>
            <label className="tap-label">
              Status
              <select className="tap-input" name="status" defaultValue={seller.status}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="tap-label">
              Seller Logo
              <input className="tap-input" name="seller_logo" type="file" accept="image/*" />
            </label>
          </div>
          <button className="tap-button tap-button-primary min-h-12 w-full md:w-max" type="submit">
            Save Seller
          </button>
        </form>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-ink">{value}</p>
    </div>
  );
}
