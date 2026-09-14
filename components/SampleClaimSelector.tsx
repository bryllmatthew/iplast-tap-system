"use client";

import { useMemo, useState } from "react";
import { PackageCheck } from "lucide-react";

import type { Brand, EventProduct, Product } from "@/lib/types";

type SampleClaimSelectorProps = {
  eventId: string;
  token: string;
  brands: Brand[];
  products: Product[];
  eventProducts: EventProduct[];
  alreadyClaimedProductIds: string[];
  action: (formData: FormData) => void;
};

export function SampleClaimSelector({
  eventId,
  token,
  brands,
  products,
  eventProducts,
  alreadyClaimedProductIds,
  action
}: SampleClaimSelectorProps) {
  const availableBrands = useMemo(
    () => brands.filter((brand) => products.some((product) => product.brand_id === brand.id)),
    [brands, products]
  );
  const [brandId, setBrandId] = useState(availableBrands[0]?.id || "");

  const brandProducts = products.filter((product) => product.brand_id === brandId);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="token" value={token} />

      <label className="tap-label">
        1. Select Brand
        <select className="tap-input" name="brand_id" required value={brandId} onChange={(event) => setBrandId(event.target.value)}>
          {availableBrands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.brand_name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3">
        <p className="text-sm font-black uppercase text-slate-400">2. Select Product Samples</p>
        {brandProducts.map((product) => {
          const eventProduct = eventProducts.find((item) => item.product_id === product.id);
          const remaining = eventProduct?.available_quantity || 0;
          const alreadyClaimed = alreadyClaimedProductIds.includes(product.id);
          const disabled = alreadyClaimed || remaining <= 0;

          return (
            <label key={product.id} className={`rounded-lg border p-3 ${disabled ? "border-slate-200 bg-slate-50 opacity-70" : "border-slate-200 bg-white"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <span className="flex min-w-0 flex-1 items-start gap-3">
                  <input className="mt-1 size-4 accent-cyan-600" type="checkbox" name="product_id" value={product.id} disabled={disabled} />
                  <span className="min-w-0">
                    <span className="block font-black text-ink">{product.product_name}</span>
                    <span className="mt-1 block text-sm font-bold text-slate-500">
                      {remaining} left{product.pid ? ` - PID ${product.pid}` : ""}
                      {alreadyClaimed ? " - already claimed" : ""}
                    </span>
                  </span>
                </span>
                <span className="tap-label w-28">
                  3. Quantity
                  <input className="tap-input" min={1} max={Math.max(remaining, 1)} name={`quantity_${product.id}`} type="number" defaultValue={1} disabled={disabled} />
                </span>
              </div>
            </label>
          );
        })}
        {!brandProducts.length ? <div className="rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-500">No products for this brand.</div> : null}
      </div>

      <button className="tap-button tap-button-primary w-full min-h-14 text-base" type="submit">
        <PackageCheck className="size-5" />
        Issue Selected Samples
      </button>
    </form>
  );
}
