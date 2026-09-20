import type { Brand, FormResponse, Product, Seller } from "@/lib/types";

export function creatorPlatformTags(response?: FormResponse) {
  const answers = response?.answers || {};
  const hasValue = (key: string) => Boolean(String(answers[key] || "").trim());
  const tags: string[] = [];

  if (hasValue("tiktok_username") || hasValue("tiktok_profile_url") || hasValue("tiktok_last_month_gmv") || hasValue("gmv_max_total")) {
    tags.push("TikTok Creator");
  }
  if (
    hasValue("shopee_username") ||
    hasValue("shopee_profile_link") ||
    hasValue("shopee_affiliate_status") ||
    hasValue("shopee_follower_count") ||
    hasValue("shopee_last_month_gmv")
  ) {
    tags.push("Shopee Creator");
  }
  if (hasValue("facebook_username") || hasValue("facebook_profile_link") || hasValue("facebook_follower_count")) {
    tags.push("Facebook Creator");
  }

  return tags;
}

export function sellerPlatformTags(seller: Seller, brands: Brand[] = [], products: Product[] = [], extraValues: string[] = []) {
  const haystack = [
    seller.company_name,
    seller.shop_code || "",
    seller.shop_link || "",
    ...brands.map((brand) => brand.brand_name),
    ...products.flatMap((product) => [product.product_name, product.product_link || "", product.pid || "", product.sku || ""]),
    ...extraValues
  ]
    .join(" ")
    .toLowerCase();

  const tags: string[] = [];
  if (haystack.includes("shopee")) tags.push("Shopee Seller");
  if (haystack.includes("tiktok") || haystack.includes("tik tok")) tags.push("TikTok Seller");

  return tags;
}
