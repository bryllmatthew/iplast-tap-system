import { addBrandAction, addProductAction, updateProductAction } from "@/app/actions";
import { number } from "@/lib/format";
import { listSellerDashboard, listSellerProductRows } from "@/lib/repository";

export default async function SellerProductsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; result?: string }>;
}) {
  const query = await searchParams;
  const dashboard = await listSellerDashboard();
  const productRows = await listSellerProductRows();

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <p className="text-sm font-black uppercase text-cyan-700">Products</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Brands and sample inventory</h1>
        <p className="mt-2 text-slate-600">Add multiple brands and products, then monitor samples remaining and given to creators.</p>
        {query.message ? (
          <div className={`mt-4 rounded-lg border p-3 font-bold ${query.result === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {query.message}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="tap-card p-5">
          <h2 className="text-xl font-black text-ink">Add Brand</h2>
          <form action={addBrandAction} className="mt-4 grid gap-3">
            <label className="tap-label">
              Brand Name
              <input className="tap-input" name="brand_name" required placeholder="ABC Beauty" />
            </label>
            <label className="tap-label">
              Logo URL
              <input className="tap-input" name="logo_url" placeholder="https://..." />
            </label>
            <label className="tap-label">
              Description
              <textarea className="tap-input min-h-24" name="description" placeholder="Short brand description." />
            </label>
            <button className="tap-button tap-button-primary" type="submit">
              Add Brand
            </button>
          </form>
        </section>

        <section className="tap-card p-5">
          <h2 className="text-xl font-black text-ink">Add Product</h2>
          <form action={addProductAction} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="tap-label">
              Brand
              <select className="tap-input" name="brand_id" required>
                {dashboard.brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.brand_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="tap-label">
              Product Name
              <input className="tap-input" name="product_name" required placeholder="Vitamin C Serum" />
            </label>
            <label className="tap-label">
              SKU
              <input className="tap-input" name="sku" placeholder="ABC-VITC-30" />
            </label>
            <label className="tap-label">
              Sample Inventory
              <input className="tap-input" name="sample_inventory" type="number" min={0} defaultValue={100} />
            </label>
            <label className="tap-label">
              Max Claims Per Creator
              <input className="tap-input" name="max_claims_per_creator" type="number" min={1} defaultValue={1} />
            </label>
            <label className="tap-label">
              Image URL
              <input className="tap-input" name="image_url" placeholder="https://..." />
            </label>
            <label className="tap-label md:col-span-2">
              Description
              <textarea className="tap-input min-h-24" name="description" placeholder="Product sample notes." />
            </label>
            <button className="tap-button tap-button-primary md:col-span-2" type="submit">
              Add Product
            </button>
          </form>
        </section>
      </div>

      <section className="tap-card overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-black text-ink">Product Monitor</h2>
          <p className="mt-2 text-slate-600">Track what is left and what has already been given to creators.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left">
            <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="p-4">Brand</th>
                <th className="p-4">Product</th>
                <th className="p-4">Description</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Initial Inventory</th>
                <th className="p-4">Given</th>
                <th className="p-4">Remaining</th>
                <th className="p-4">Limit</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {productRows.map(({ product, brand, issued, remaining }) => (
                <tr key={product.id} className="border-t border-slate-100 align-middle">
                  <td className="whitespace-nowrap p-3 text-slate-600">{brand.brand_name}</td>
                  <td className="p-3">
                    <form id={`product-${product.id}`} action={updateProductAction}>
                      <input type="hidden" name="product_id" value={product.id} />
                      <input className="tap-input min-w-44" name="product_name" defaultValue={product.product_name} required />
                    </form>
                  </td>
                  <td className="p-3">
                    <input className="tap-input min-w-56" form={`product-${product.id}`} name="description" defaultValue={product.description} placeholder="Description" />
                  </td>
                  <td className="p-3">
                    <input className="tap-input min-w-32" form={`product-${product.id}`} name="sku" defaultValue={product.sku || ""} />
                  </td>
                  <td className="p-3">
                    <input className="tap-input min-w-24" form={`product-${product.id}`} name="sample_inventory" type="number" min={0} defaultValue={product.sample_inventory} />
                  </td>
                  <td className="p-3 font-black text-cyan-700">{number(issued)}</td>
                  <td className="p-3">
                    <input className="tap-input min-w-24" form={`product-${product.id}`} name="available_quantity" type="number" min={0} defaultValue={remaining} />
                  </td>
                  <td className="p-3">
                    <input className="tap-input min-w-24" form={`product-${product.id}`} name="max_claims_per_creator" type="number" min={1} defaultValue={product.max_claims_per_creator} />
                  </td>
                  <td className="p-3">
                    <button className="tap-button tap-button-primary whitespace-nowrap" form={`product-${product.id}`} type="submit">
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
