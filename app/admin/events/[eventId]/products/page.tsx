import { updateEventProductInventoryAction } from "@/app/actions";
import { getEventById, listEventSellerRows } from "@/lib/repository";

export default async function EventProductsPage({
  params,
  searchParams
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ message?: string; result?: string }>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const event = await getEventById(eventId);
  const rows = await listEventSellerRows(eventId);
  const productRows = rows.flatMap(({ seller, brands, products, eventProducts }) =>
    products.map((product) => ({
      seller,
      brand: brands.find((item) => item.id === product.brand_id),
      product,
      eventProduct: eventProducts.find((item) => item.product_id === product.id)
    }))
  );

  return (
    <section className="tap-card overflow-hidden">
      <div className="border-b border-slate-200 p-5">
        <h1 className="text-3xl font-black text-ink">Event Products</h1>
        <p className="mt-2 text-slate-600">{event?.event_name || "Event"} sample inventory and per-creator claim limits.</p>
        {query.message ? (
          <div className={`mt-4 rounded-lg border p-3 text-sm font-bold ${query.result === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {query.message}
          </div>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50 text-sm font-black uppercase text-slate-500">
            <tr>
              <th className="p-4">Seller</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Product</th>
              <th className="p-4">Available</th>
              <th className="p-4">Limit Per Creator</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {productRows.map(({ seller, brand, product, eventProduct }) => (
              <tr key={`${seller.id}-${product.id}`} className="border-t border-slate-100">
                <td className="p-4 text-slate-600">{seller.company_name}</td>
                <td className="p-4 text-slate-600">{brand?.brand_name || "-"}</td>
                <td className="p-4">
                  <p className="font-black text-ink">{product.product_name}</p>
                  <p className="text-sm text-slate-500">{product.pid || product.sku || product.description || "No PID"}</p>
                </td>
                <td className="p-4">
                  <form id={`event-product-${product.id}`} action={updateEventProductInventoryAction}>
                    <input type="hidden" name="event_id" value={eventId} />
                    <input type="hidden" name="product_id" value={product.id} />
                    <input type="hidden" name="event_product_id" value={eventProduct?.id || ""} />
                    <input className="tap-input min-w-28" name="available_quantity" type="number" min={0} defaultValue={eventProduct?.available_quantity || 0} />
                  </form>
                </td>
                <td className="p-4">
                  <input
                    className="tap-input min-w-24"
                    form={`event-product-${product.id}`}
                    name="max_claims_per_creator"
                    type="number"
                    min={1}
                    defaultValue={eventProduct?.max_claims_per_creator || product.max_claims_per_creator}
                  />
                </td>
                <td className="p-4">
                  <span className={`status-pill ${eventProduct ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>
                    {eventProduct?.status || "missing"}
                  </span>
                </td>
                <td className="p-4">
                  <button className="tap-button tap-button-primary whitespace-nowrap" form={`event-product-${product.id}`} type="submit">
                    Save
                  </button>
                </td>
              </tr>
            ))}
            {!productRows.length ? (
              <tr>
                <td className="p-8 text-center text-slate-500" colSpan={7}>
                  No seller products assigned to this event.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
