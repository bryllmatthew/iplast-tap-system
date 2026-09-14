import { number } from "@/lib/format";
import { listSellerDashboard } from "@/lib/repository";

export default async function EventProductsPage() {
  const dashboard = await listSellerDashboard();

  return (
    <section className="tap-card overflow-hidden">
      <div className="border-b border-slate-200 p-5">
        <h1 className="text-3xl font-black text-ink">Event Products</h1>
        <p className="mt-2 text-slate-600">Event-level sample inventory and per-creator claim limits.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-slate-50 text-sm font-black uppercase text-slate-500">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Available</th>
              <th className="p-4">Limit Per Creator</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.products.map((product) => {
              const eventProduct = dashboard.eventProducts.find((item) => item.product_id === product.id)!;
              const brand = dashboard.brands.find((item) => item.id === product.brand_id)!;
              return (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="p-4">
                    <p className="font-black text-ink">{product.product_name}</p>
                    <p className="text-sm text-slate-500">{product.description}</p>
                  </td>
                  <td className="p-4 text-slate-600">{product.sku}</td>
                  <td className="p-4 text-slate-600">{brand.brand_name}</td>
                  <td className="p-4 font-black text-ink">{number(eventProduct.available_quantity)}</td>
                  <td className="p-4 text-slate-600">{eventProduct.max_claims_per_creator} per creator</td>
                  <td className="p-4">
                    <span className="status-pill bg-green-50 text-green-700">{eventProduct.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
