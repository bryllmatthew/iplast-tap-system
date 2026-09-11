"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type ProductRow = {
  id: number;
};

export function AddSellerProductsTable() {
  const [rows, setRows] = useState<ProductRow[]>([{ id: 1 }, { id: 2 }, { id: 3 }]);

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase text-slate-400">Products</h3>
          <p className="mt-1 text-sm text-slate-600">Add one product per row. Quantity is the event sample inventory.</p>
        </div>
        <button className="tap-button tap-button-secondary" type="button" onClick={() => setRows((current) => [...current, { id: Date.now() }])}>
          <Plus className="size-4" />
          Add Row
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[680px] text-left">
          <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
            <tr>
              <th className="p-3">Brand</th>
              <th className="p-3">Product</th>
              <th className="w-32 p-3">Quantity</th>
              <th className="w-16 p-3"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="p-3">
                  <input className="tap-input" name="product_brand" placeholder="ABC Beauty" />
                </td>
                <td className="p-3">
                  <input className="tap-input" name="product_name" placeholder={index === 0 ? "Vitamin C Serum" : "Product name"} />
                </td>
                <td className="p-3">
                  <input className="tap-input" name="product_quantity" type="number" min={0} placeholder="100" />
                </td>
                <td className="p-3">
                  <button
                    className="tap-button tap-button-secondary min-h-9 w-9 p-0"
                    type="button"
                    aria-label="Remove product row"
                    onClick={() => setRows((current) => (current.length > 1 ? current.filter((item) => item.id !== row.id) : current))}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
