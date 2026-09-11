import { siteUrl } from "@/lib/env";
import type {
  Attendance,
  Brand,
  Creator,
  CreatorQr,
  Event,
  EventProduct,
  EventSeller,
  FormResponse,
  FormVersion,
  Product,
  Registration,
  SampleClaim,
  Seller
} from "@/lib/types";

const now = new Date("2026-09-10T14:14:00+08:00").toISOString();

export const demoEvent: Event = {
  id: "evt_davao_2026",
  event_name: "TAP Seller Creator Matchmaking - Davao",
  event_slug: "davao-seller-matchmaking-sept-2026",
  description: "A curated seller and TikTok creator matchmaking event for sample redemption and affiliate discovery.",
  venue: "SMX Convention Center Davao",
  address: "Lanang, Davao City",
  event_date: "2026-09-10",
  start_time: "10:00",
  end_time: "17:00",
  registration_start: "2026-08-01T00:00:00+08:00",
  registration_end: "2026-09-09T23:59:59+08:00",
  maximum_creator_capacity: 300,
  poster_url:
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1400&q=80",
  status: "ongoing"
};

export const demoForm: FormVersion = {
  id: "formv_davao_1",
  event_id: demoEvent.id,
  version_number: 1,
  status: "published",
  published_at: "2026-08-01T08:00:00+08:00",
  fields: [
    { id: "full_name", label: "Full Name", field_type: "short_text", required: true, sort_order: 1 },
    { id: "tiktok_username", label: "TikTok Username", field_type: "short_text", required: true, sort_order: 2 },
    { id: "tiktok_profile_url", label: "TikTok Profile URL", field_type: "url", required: true, sort_order: 3 },
    { id: "mobile", label: "Mobile Number", field_type: "phone", required: true, sort_order: 4 },
    { id: "email", label: "Email", field_type: "email", required: true, sort_order: 5 },
    { id: "location", label: "Location", field_type: "short_text", required: true, sort_order: 6 },
    { id: "follower_count", label: "Follower Count", field_type: "number", required: true, sort_order: 7 },
    { id: "gmv_max_total", label: "GMV Max Total", field_type: "number", required: true, sort_order: 8 },
    {
      id: "creator_category",
      label: "Creator Category/Niche",
      field_type: "single_select",
      required: true,
      options: ["Beauty", "Fashion", "Food", "Electronics", "Home", "Health", "Lifestyle"],
      sort_order: 9
    },
    {
      id: "content_categories",
      label: "Content Categories",
      field_type: "multi_select",
      required: false,
      options: ["Beauty", "Fashion", "Food", "Electronics", "Home", "Health", "Lifestyle"],
      sort_order: 10
    },
    {
      id: "affiliate_experience",
      label: "Previous Affiliate Experience",
      field_type: "long_text",
      required: false,
      sort_order: 11
    }
  ]
};

export const demoCreators: Creator[] = [
  {
    id: "cre_juan",
    full_name: "Juan Dela Cruz",
    tiktok_username: "mystorecreator",
    tiktok_profile_url: "https://www.tiktok.com/@mystorecreator",
    email: "juan@example.com",
    mobile: "+639171110001",
    location: "Davao City",
    follower_count: 125000,
    gmv_max_total: 850000,
    creator_category: "Beauty / Lifestyle",
    content_categories: ["Beauty", "Lifestyle"],
    affiliate_experience: "Live selling and short-form beauty reviews."
  },
  {
    id: "cre_maria",
    full_name: "Maria Santos",
    tiktok_username: "mariashop",
    tiktok_profile_url: "https://www.tiktok.com/@mariashop",
    email: "maria@example.com",
    mobile: "+639171110002",
    location: "Davao del Sur",
    follower_count: 82000,
    gmv_max_total: 420000,
    creator_category: "Fashion",
    content_categories: ["Fashion", "Lifestyle"],
    affiliate_experience: "Fashion hauls and affiliate product showcases."
  },
  {
    id: "cre_carlo",
    full_name: "Carlo Reyes",
    tiktok_username: "carlo.ph",
    tiktok_profile_url: "https://www.tiktok.com/@carlo.ph",
    email: "carlo@example.com",
    mobile: "+639171110003",
    location: "Davao City",
    follower_count: 210000,
    gmv_max_total: 1200000,
    creator_category: "Food / Lifestyle",
    content_categories: ["Food", "Lifestyle"],
    affiliate_experience: "High-volume food and home product affiliate campaigns."
  }
];

export const demoResponses: FormResponse[] = demoCreators.map((creator, index) => ({
  id: `resp_${creator.id}`,
  event_id: demoEvent.id,
  creator_id: creator.id,
  form_version_id: demoForm.id,
  field_snapshot: demoForm.fields,
  submitted_at: new Date(Date.parse(now) - (index + 1) * 3600_000).toISOString(),
  answers: {
    full_name: creator.full_name,
    tiktok_username: creator.tiktok_username,
    tiktok_profile_url: creator.tiktok_profile_url,
    mobile: creator.mobile,
    email: creator.email,
    location: creator.location,
    follower_count: creator.follower_count,
    gmv_max_total: creator.gmv_max_total,
    creator_category: creator.creator_category,
    content_categories: creator.content_categories,
    affiliate_experience: creator.affiliate_experience
  }
}));

export const demoRegistrations: Registration[] = [
  {
    id: "reg_juan",
    event_id: demoEvent.id,
    creator_id: "cre_juan",
    form_response_id: "resp_cre_juan",
    registration_status: "approved",
    registered_at: "2026-09-05T09:15:00+08:00",
    approved_at: "2026-09-06T11:30:00+08:00"
  },
  {
    id: "reg_maria",
    event_id: demoEvent.id,
    creator_id: "cre_maria",
    form_response_id: "resp_cre_maria",
    registration_status: "approved",
    registered_at: "2026-09-05T10:10:00+08:00",
    approved_at: "2026-09-06T11:35:00+08:00"
  },
  {
    id: "reg_carlo",
    event_id: demoEvent.id,
    creator_id: "cre_carlo",
    form_response_id: "resp_cre_carlo",
    registration_status: "pending",
    registered_at: "2026-09-06T15:45:00+08:00"
  }
];

export const demoAttendance: Attendance[] = [
  {
    id: "att_juan",
    event_id: demoEvent.id,
    creator_id: "cre_juan",
    registration_id: "reg_juan",
    status: "checked_in",
    checked_in_at: "2026-09-10T10:12:00+08:00",
    checked_in_by: "Event Staff"
  }
];

export const demoQr: CreatorQr[] = [
  {
    id: "qr_juan",
    event_id: demoEvent.id,
    creator_id: "cre_juan",
    registration_id: "reg_juan",
    attendance_id: "att_juan",
    qr_token: "tap_demo_juan_2026",
    qr_url: `${siteUrl()}/qr/tap_demo_juan_2026`,
    status: "active",
    generated_at: "2026-09-10T10:12:05+08:00",
    last_scanned_at: "2026-09-10T14:14:00+08:00"
  },
  {
    id: "qr_maria",
    event_id: demoEvent.id,
    creator_id: "cre_maria",
    registration_id: "reg_maria",
    qr_token: "tap_demo_maria_2026",
    qr_url: `${siteUrl()}/qr/tap_demo_maria_2026`,
    status: "approved_not_checked_in",
    generated_at: "2026-09-05T10:10:05+08:00"
  },
  {
    id: "qr_carlo",
    event_id: demoEvent.id,
    creator_id: "cre_carlo",
    registration_id: "reg_carlo",
    qr_token: "tap_demo_carlo_2026",
    qr_url: `${siteUrl()}/qr/tap_demo_carlo_2026`,
    status: "pending_approval",
    generated_at: "2026-09-06T15:45:05+08:00"
  }
];

export const demoSeller: Seller = {
  id: "sel_abc",
  company_name: "ABC Trading",
  contact_name: "Ana Bautista",
  email: "seller@example.com",
  phone: "+639178880000",
  status: "active"
};

export const demoBrands: Brand[] = [
  {
    id: "bra_abc_beauty",
    seller_id: demoSeller.id,
    brand_name: "ABC Beauty",
    description: "Beauty and wellness products for creator-led commerce.",
    status: "active"
  }
];

export const demoProducts: Product[] = [
  {
    id: "prd_vitc",
    brand_id: "bra_abc_beauty",
    product_name: "Vitamin C Serum",
    sku: "ABC-VITC-30",
    description: "Brightening serum sample.",
    sample_inventory: 100,
    max_claims_per_creator: 1,
    status: "active"
  },
  {
    id: "prd_sunscreen",
    brand_id: "bra_abc_beauty",
    product_name: "Sunscreen",
    sku: "ABC-SUN-50",
    description: "Daily SPF sample.",
    sample_inventory: 80,
    max_claims_per_creator: 1,
    status: "active"
  },
  {
    id: "prd_collagen",
    brand_id: "bra_abc_beauty",
    product_name: "Collagen Drink",
    sku: "ABC-COL-12",
    description: "Beauty drink sample pack.",
    sample_inventory: 120,
    max_claims_per_creator: 1,
    status: "active"
  }
];

export const demoEventSeller: EventSeller = {
  id: "evs_abc",
  event_id: demoEvent.id,
  seller_id: demoSeller.id,
  booth_name: "ABC Beauty Booth",
  booth_number: "Booth 12",
  status: "active"
};

export const demoEventProducts: EventProduct[] = demoProducts.map((product, index) => ({
  id: `evp_${product.id}`,
  event_id: demoEvent.id,
  product_id: product.id,
  available_quantity: [42, 65, 90][index] || product.sample_inventory,
  max_claims_per_creator: 1,
  status: "active"
}));

export const demoClaims: SampleClaim[] = [
  {
    id: "cla_juan_vitc",
    event_id: demoEvent.id,
    creator_id: "cre_juan",
    seller_id: demoSeller.id,
    brand_id: "bra_abc_beauty",
    product_id: "prd_vitc",
    quantity: 1,
    claimed_at: "2026-09-10T14:14:00+08:00",
    claimed_by: "ABC Seller Staff",
    booth_id: "booth_12",
    qr_scan_id: "scan_juan_1",
    status: "claimed"
  }
];
