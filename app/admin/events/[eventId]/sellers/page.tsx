import Link from "next/link";
import { Mail, Pencil, Plus, X } from "lucide-react";

import { addEventSellerAction, updateSellerAction } from "@/app/actions";
import { AddSellerProductsTable } from "@/components/AddSellerProductsTable";
import { DeleteSellerButton } from "@/components/DeleteSellerButton";
import { number } from "@/lib/format";
import { getEventById, listEventSellerRows } from "@/lib/repository";
import type { EventSeller, Seller } from "@/lib/types";

export default async function EventSellersPage({
  params,
  searchParams
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{
    addSeller?: string;
    sellerMessage?: string;
    sellerResult?: string;
    inviteEmail?: string;
    invitePassword?: string;
    inviteLogin?: string;
    editSeller?: string;
  }>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const event = await getEventById(eventId);
  const rows = await listEventSellerRows(eventId);
  const showForm = query.addSeller === "1";
  const editRow = query.editSeller ? rows.find(({ seller }) => seller.id === query.editSeller) : undefined;

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-ink">Event Sellers</h1>
            <p className="mt-2 text-slate-600">
              Assign sellers, booth numbers, product brands, and sample inventory for {event?.event_name || "this event"}.
            </p>
          </div>
          <Link className="tap-button tap-button-primary" href={`/admin/events/${eventId}/sellers?addSeller=1`}>
            <Plus className="size-4" />
            Add Seller
          </Link>
        </div>
        {query.sellerMessage ? (
          <div
            className={`mt-4 rounded-lg border p-3 font-bold ${
              query.sellerResult === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {query.sellerMessage}
          </div>
        ) : null}
      </div>

      {query.inviteEmail && query.invitePassword && query.inviteLogin ? (
        <section className="tap-card p-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-1 size-5 text-cyan-700" />
            <div>
              <h2 className="text-xl font-black text-ink">Seller Login Email Preview</h2>
              <p className="mt-2 text-slate-600">
                In production, this will be sent through Supabase Auth invite email or your SMTP provider. For this MVP demo, use these details:
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Info label="Email" value={query.inviteEmail} />
                <Info label="Temporary Password" value={query.invitePassword} />
                <Info label="Login Page" value={query.inviteLogin} />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4">
        {rows.map(({ seller, eventSeller, brands, products, eventProducts, claims, invite }) => {
          const issued = claims.reduce((total, claim) => total + claim.quantity, 0);
          const remaining = eventProducts.reduce((total, eventProduct) => total + eventProduct.available_quantity, 0);

          return (
            <article key={eventSeller.id} className="tap-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-4">
                  {seller.logo_url ? (
                    <img className="size-14 rounded-lg border border-slate-200 object-cover" src={seller.logo_url} alt="" />
                  ) : (
                    <div className="grid size-14 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-xl font-black text-cyan-700">
                      {seller.company_name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-black text-ink">{seller.company_name}</h2>
                    <p className="text-slate-600">{seller.email}</p>
                    {invite ? <p className="mt-1 text-xs font-bold text-slate-500">Invite {invite.status}</p> : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="status-pill bg-green-50 text-green-700">{eventSeller.status}</span>
                  <Link className="tap-button tap-button-secondary min-h-10 px-3 text-xs" href={`/admin/events/${eventId}/sellers?editSeller=${seller.id}`}>
                    <Pencil className="size-4" />
                    Edit
                  </Link>
                  <DeleteSellerButton
                    sellerId={seller.id}
                    sellerName={seller.company_name}
                    eventId={eventId}
                    redirectTo={`/admin/events/${eventId}/sellers`}
                    compact
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <Info label="Booth" value={eventSeller.booth_number} />
                <Info label="Booth Name" value={eventSeller.booth_name || "-"} />
                <Info label="Brands" value={number(brands.length)} />
              <Info label="Products" value={number(products.length)} />
              <Info label="Given" value={number(issued)} />
              <Info label="Remaining" value={number(remaining)} />
            </div>
              {(seller.shop_code || seller.shop_link || seller.open_plan_commission || seller.tap_commission) ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Info label="Shop Code" value={seller.shop_code || "-"} />
                  <Info label="Shop Link" value={seller.shop_link || "-"} />
                  <Info label="Open Plan Commission" value={`${seller.open_plan_commission}%`} />
                  <Info label="TAP Commission" value={`${seller.tap_commission}%`} />
                </div>
              ) : null}
              {brands.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <span key={brand.id} className="status-pill bg-cyan-50 text-cyan-700">
                      {brand.brand_name}
                    </span>
                  ))}
                </div>
              ) : null}
              {products.length ? (
                <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                      <tr>
                        <th className="p-3">Brand</th>
                        <th className="p-3">Product</th>
                        <th className="p-3">PID</th>
                        <th className="p-3">Product Link</th>
                        <th className="p-3">Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const brand = brands.find((item) => item.id === product.brand_id);
                        const eventProduct = eventProducts.find((item) => item.product_id === product.id);
                        return (
                          <tr key={product.id} className="border-t border-slate-100">
                            <td className="p-3 text-slate-600">{brand?.brand_name || "-"}</td>
                            <td className="p-3 font-bold text-ink">{product.product_name}</td>
                            <td className="p-3 text-slate-600">{product.pid || product.sku || "-"}</td>
                            <td className="p-3">
                              {product.product_link ? (
                                <a className="font-bold text-cyan-700 underline" href={product.product_link} target="_blank" rel="noreferrer">
                                  Open
                                </a>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="p-3 font-black text-cyan-700">{number(eventProduct?.available_quantity || 0)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {showForm ? <AddSellerModal eventId={eventId} /> : null}
      {editRow ? <EditEventSellerModal eventId={eventId} seller={editRow.seller} eventSeller={editRow.eventSeller} /> : null}
    </section>
  );
}

function AddSellerModal({ eventId }: { eventId: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="tap-card max-h-[92vh] w-full max-w-3xl overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-ink">Add Seller</h2>
            <p className="mt-2 text-slate-600">Create the seller, assign a booth, add starter products, and queue login details.</p>
          </div>
          <Link className="tap-button tap-button-secondary" href={`/admin/events/${eventId}/sellers`} aria-label="Close add seller form">
            <X className="size-4" />
          </Link>
        </div>

        <form action={addEventSellerAction} className="mt-5 grid gap-4">
          <input type="hidden" name="event_id" value={eventId} />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="tap-label">
              Seller Name
              <input className="tap-input" name="seller_name" required placeholder="ABC Trading" />
            </label>
            <label className="tap-label">
              Email
              <input className="tap-input" name="email" required type="email" placeholder="seller@example.com" />
            </label>
            <label className="tap-label">
              Seller Password
              <input className="tap-input" name="password" required type="password" placeholder="Set seller password" />
            </label>
            <label className="tap-label">
              Phone
              <input className="tap-input" name="phone" placeholder="+63917..." />
            </label>
            <label className="tap-label">
              Shop Code
              <input className="tap-input" name="shop_code" placeholder="TAP-ABC" />
            </label>
            <label className="tap-label">
              Shop Link
              <input className="tap-input" name="shop_link" type="url" placeholder="https://..." />
            </label>
            <label className="tap-label">
              Open Plan Commission %
              <input className="tap-input" name="open_plan_commission" type="number" min={0} step="0.01" defaultValue={0} />
            </label>
            <label className="tap-label">
              TAP Commission %
              <input className="tap-input" name="tap_commission" type="number" min={0} step="0.01" defaultValue={0} />
            </label>
            <label className="tap-label">
              Seller Logo
              <input className="tap-input" name="seller_logo" type="file" accept="image/*" />
            </label>
            <label className="tap-label">
              Booth Number
              <input className="tap-input" name="booth_number" required placeholder="Booth 12" />
            </label>
            <label className="tap-label">
              Booth Name
              <input className="tap-input" name="booth_name" placeholder="ABC Beauty Booth" />
            </label>
          </div>

          <AddSellerProductsTable />

          <button className="tap-button tap-button-primary min-h-12 w-full md:w-max" type="submit">
            Create Seller and Queue Login Email
          </button>
        </form>
      </div>
    </div>
  );
}

function EditEventSellerModal({ eventId, seller, eventSeller }: { eventId: string; seller: Seller; eventSeller: EventSeller }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="tap-card max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-ink">Edit Seller</h2>
            <p className="mt-2 text-slate-600">Update seller account and event booth details.</p>
          </div>
          <Link className="tap-button tap-button-secondary" href={`/admin/events/${eventId}/sellers`} aria-label="Close edit seller form">
            <X className="size-4" />
          </Link>
        </div>

        <form action={updateSellerAction} className="mt-5 grid gap-4">
          <input type="hidden" name="seller_id" value={seller.id} />
          <input type="hidden" name="event_id" value={eventId} />
          <input type="hidden" name="redirect_to" value={`/admin/events/${eventId}/sellers`} />
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
              Email
              <input className="tap-input" name="email" required type="email" defaultValue={seller.email} />
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
              Booth Number
              <input className="tap-input" name="booth_number" required defaultValue={eventSeller.booth_number} />
            </label>
            <label className="tap-label">
              Booth Name
              <input className="tap-input" name="booth_name" defaultValue={eventSeller.booth_name || seller.company_name} />
            </label>
            <label className="tap-label">
              Status
              <select className="tap-input" name="status" defaultValue={seller.status === "inactive" || eventSeller.status === "inactive" ? "inactive" : "active"}>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-4">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words font-black text-ink">{value}</p>
    </div>
  );
}
