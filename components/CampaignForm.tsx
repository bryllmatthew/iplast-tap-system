import Link from "next/link";

import { saveCampaignAction } from "@/app/actions";
import type { AffiliateCampaign, Brand, Seller } from "@/lib/types";

export function CampaignForm({
  campaign,
  brandOptions
}: {
  campaign?: AffiliateCampaign;
  brandOptions: { brand: Brand; seller: Seller }[];
}) {
  return (
    <form action={saveCampaignAction} className="grid gap-4">
      {campaign ? <input type="hidden" name="campaign_id" value={campaign.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="tap-label md:col-span-2">
          Campaign Name
          <input className="tap-input" name="campaign_name" required defaultValue={campaign?.campaign_name || ""} placeholder="Shopee Kollab Affiliate Push" />
        </label>
        <label className="tap-label">
          Brand
          <select className="tap-input" name="brand_id" required defaultValue={campaign?.brand_id || ""}>
            <option value="">Select brand</option>
            {brandOptions.map(({ brand, seller }) => (
              <option key={brand.id} value={brand.id}>
                {brand.brand_name} - {seller.company_name}
              </option>
            ))}
          </select>
        </label>
        <label className="tap-label">
          Status
          <select className="tap-input" name="status" defaultValue={campaign?.status || "draft"}>
            <option value="draft">Draft</option>
            <option value="recruiting">Recruiting</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="tap-label">
          Open Plan Commission %
          <input className="tap-input" name="open_plan_commission" required type="number" min={0} step="0.01" defaultValue={campaign?.open_plan_commission || 0} />
        </label>
        <label className="tap-label">
          Campaign Product Link
          <input className="tap-input" name="campaign_product_link" type="url" defaultValue={campaign?.campaign_product_link || ""} placeholder="https://..." />
        </label>
        <label className="tap-label md:col-span-2">
          Campaign Assets Google Drive Link
          <input className="tap-input" name="campaign_assets_url" type="url" defaultValue={campaign?.campaign_assets_url || ""} placeholder="https://drive.google.com/..." />
        </label>
        <label className="tap-label md:col-span-2">
          Campaign Sample Videos For Reference
          <textarea
            className="tap-input min-h-24"
            name="sample_video_links"
            defaultValue={campaign?.sample_video_links.join("\n") || ""}
            placeholder="Add one link per line"
          />
        </label>
        <label className="tap-label md:col-span-2">
          Campaign Mechanics and Guidelines
          <textarea className="tap-input min-h-32" name="campaign_mechanics" required defaultValue={campaign?.campaign_mechanics || ""} />
        </label>
        <label className="tap-label md:col-span-2">
          Campaign Requirements
          <textarea className="tap-input min-h-32" name="campaign_requirements" required defaultValue={campaign?.campaign_requirements || ""} />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="tap-button tap-button-primary" type="submit">
          {campaign ? "Save Campaign" : "Create Campaign"}
        </button>
        <Link className="tap-button tap-button-secondary" href="/admin/campaigns">
          Cancel
        </Link>
      </div>
    </form>
  );
}
