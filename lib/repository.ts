import "server-only";

import { cache } from "react";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

import {
  demoAttendance,
  demoBrands,
  demoClaims,
  demoCreators,
  demoEvent,
  demoEventProducts,
  demoEventSeller,
  demoForm,
  demoProducts,
  demoQr,
  demoRegistrations,
  demoResponses,
  demoSeller
} from "@/lib/demo-data";
import { cleanEnv } from "@/lib/clean-env";
import { appUrl, canonicalAppUrl } from "@/lib/env";
import { defaultRegistrationFields, registrationFieldsFromFormData, sortRegistrationFields } from "@/lib/registration-fields";
import { normalizeSellerUsername, sellerUsernameToAuthEmail } from "@/lib/seller-login";
import type {
  Attendance,
  AffiliateCampaign,
  Brand,
  CampaignApplication,
  Creator,
  CreatorAccount,
  CreatorQr,
  Event,
  EventProduct,
  EventStatus,
  EventSeller,
  FormField,
  FormVersion,
  FormResponse,
  Product,
  Registration,
  RegistrationRow,
  QrValidation,
  SampleClaim,
  Seller,
  SellerInvite
} from "@/lib/types";

type DemoState = {
  events: Event[];
  sellers: Seller[];
  eventSellers: EventSeller[];
  creators: Creator[];
  responses: FormResponse[];
  registrations: Registration[];
  attendance: Attendance[];
  qrs: CreatorQr[];
  brands: Brand[];
  products: Product[];
  eventProducts: EventProduct[];
  claims: SampleClaim[];
  sellerInvites: SellerInvite[];
  creatorAccounts?: CreatorAccount[];
  campaigns?: AffiliateCampaign[];
  campaignApplications?: CampaignApplication[];
  forms: FormVersion[];
};

const defaultOrganizationId = "00000000-0000-0000-0000-000000000001";
const eventSelect =
  "id,event_name,event_slug,description,venue,address,event_date,start_time,end_time,registration_start,registration_end,maximum_creator_capacity,poster_url,status";
const sellerSelect =
  "id,company_name,contact_name,username,email,phone,shop_code,shop_link,open_plan_commission,tap_commission,logo_url,status";
const productSelect =
  "id,brand_id,product_name,sku,pid,product_link,image_url,description,sample_inventory,max_claims_per_creator,status";
const campaignSelect =
  "id,organization_id,campaign_name,campaign_slug,brand_id,open_plan_commission,campaign_mechanics,campaign_requirements,campaign_assets_url,sample_video_links,campaign_product_link,status,created_by,created_at,updated_at";

function createServiceClient() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !key) return null;

  return createSupabaseAdmin(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function eventFromRow(row: Record<string, unknown>): Event {
  return {
    id: String(row.id),
    event_name: String(row.event_name || ""),
    event_slug: String(row.event_slug || ""),
    description: String(row.description || ""),
    venue: String(row.venue || ""),
    address: String(row.address || ""),
    event_date: String(row.event_date || ""),
    start_time: String(row.start_time || "").slice(0, 5),
    end_time: String(row.end_time || "").slice(0, 5),
    registration_start: String(row.registration_start || ""),
    registration_end: String(row.registration_end || ""),
    maximum_creator_capacity: Number(row.maximum_creator_capacity || 300),
    poster_url: String(row.poster_url || ""),
    status: String(row.status || "draft") as EventStatus
  };
}

function sellerFromRow(row: Record<string, unknown>): Seller {
  const email = String(row.email || "");
  const username = normalizeSellerUsername(String(row.username || email.split("@")[0] || row.company_name || ""));
  return {
    id: String(row.id),
    company_name: String(row.company_name || ""),
    contact_name: String(row.contact_name || ""),
    username,
    email,
    phone: String(row.phone || ""),
    shop_code: row.shop_code ? String(row.shop_code) : undefined,
    shop_link: row.shop_link ? String(row.shop_link) : undefined,
    open_plan_commission: Number(row.open_plan_commission || 0),
    tap_commission: Number(row.tap_commission || 0),
    logo_url: row.logo_url ? String(row.logo_url) : undefined,
    status: String(row.status || "active") as Seller["status"]
  };
}

function brandFromRow(row: Record<string, unknown>): Brand {
  return {
    id: String(row.id),
    seller_id: String(row.seller_id),
    brand_name: String(row.brand_name || ""),
    logo_url: row.logo_url ? String(row.logo_url) : undefined,
    description: String(row.description || ""),
    status: String(row.status || "active") as Brand["status"]
  };
}

function productFromRow(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    brand_id: String(row.brand_id),
    product_name: String(row.product_name || ""),
    sku: String(row.sku || ""),
    pid: row.pid ? String(row.pid) : undefined,
    product_link: row.product_link ? String(row.product_link) : undefined,
    image_url: row.image_url ? String(row.image_url) : undefined,
    description: String(row.description || ""),
    sample_inventory: Number(row.sample_inventory || 0),
    max_claims_per_creator: Number(row.max_claims_per_creator || 1),
    status: String(row.status || "active") as Product["status"]
  };
}

function creatorFromRow(row: Record<string, unknown>): Creator {
  return {
    id: String(row.id),
    full_name: String(row.full_name || ""),
    tiktok_username: String(row.tiktok_username || ""),
    tiktok_profile_url: String(row.tiktok_profile_url || ""),
    email: String(row.email || ""),
    mobile: String(row.mobile || ""),
    location: String(row.location || ""),
    follower_count: Number(row.follower_count || 0),
    gmv_max_total: Number(row.gmv_max_total || 0),
    creator_category: String(row.creator_category || ""),
    content_categories: Array.isArray(row.content_categories) ? row.content_categories.map(String) : [],
    affiliate_experience: String(row.affiliate_experience || ""),
    profile_image: row.profile_image ? String(row.profile_image) : undefined,
    notes: row.notes ? String(row.notes) : undefined
  };
}

function creatorAccountFromRow(row: Record<string, unknown>): CreatorAccount {
  return {
    id: String(row.id),
    creator_id: String(row.creator_id),
    user_id: String(row.user_id),
    email: String(row.email || ""),
    status: String(row.status || "pending") as CreatorAccount["status"],
    invited_by: row.invited_by ? String(row.invited_by) : undefined,
    invited_at: String(row.invited_at || ""),
    activated_at: row.activated_at ? String(row.activated_at) : undefined,
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || "")
  };
}

function registrationFromRow(row: Record<string, unknown>): Registration {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    creator_id: String(row.creator_id),
    form_response_id: String(row.form_response_id),
    registration_status: String(row.registration_status || "pending") as Registration["registration_status"],
    registered_at: String(row.registered_at || ""),
    approved_at: row.approved_at ? String(row.approved_at) : undefined,
    notes: row.notes ? String(row.notes) : undefined
  };
}

function attendanceFromRow(row: Record<string, unknown>): Attendance {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    creator_id: String(row.creator_id),
    registration_id: String(row.registration_id),
    status: String(row.status || "checked_in") as Attendance["status"],
    checked_in_at: row.checked_in_at ? String(row.checked_in_at) : undefined,
    checked_in_by: row.checked_in_by ? String(row.checked_in_by) : undefined
  };
}

function qrFromRow(row: Record<string, unknown>): CreatorQr {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    creator_id: String(row.creator_id),
    registration_id: String(row.registration_id),
    attendance_id: row.attendance_id ? String(row.attendance_id) : undefined,
    qr_token: String(row.qr_token),
    qr_url: canonicalAppUrl(row.qr_url ? String(row.qr_url) : undefined, `/qr/${row.qr_token}`),
    status: String(row.status || "pending_approval") as CreatorQr["status"],
    generated_at: String(row.generated_at || ""),
    last_scanned_at: row.last_scanned_at ? String(row.last_scanned_at) : undefined
  };
}

function formResponseFromRow(row: Record<string, unknown>): FormResponse {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    creator_id: String(row.creator_id),
    form_version_id: String(row.form_version_id),
    field_snapshot: Array.isArray(row.field_snapshot) ? (row.field_snapshot as FormField[]) : [],
    answers: (row.answers || {}) as Record<string, unknown>,
    submitted_at: String(row.submitted_at || "")
  };
}

function eventSellerFromRow(row: Record<string, unknown>): EventSeller {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    seller_id: String(row.seller_id),
    booth_name: String(row.booth_name || ""),
    booth_number: String(row.booth_number || ""),
    status: String(row.status || "active") as EventSeller["status"]
  };
}

function campaignFromRow(row: Record<string, unknown>): AffiliateCampaign {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id || defaultOrganizationId),
    campaign_name: String(row.campaign_name || ""),
    campaign_slug: String(row.campaign_slug || ""),
    brand_id: String(row.brand_id || ""),
    open_plan_commission: Number(row.open_plan_commission || 0),
    campaign_mechanics: String(row.campaign_mechanics || ""),
    campaign_requirements: String(row.campaign_requirements || ""),
    campaign_assets_url: row.campaign_assets_url ? String(row.campaign_assets_url) : undefined,
    sample_video_links: Array.isArray(row.sample_video_links) ? row.sample_video_links.map(String) : [],
    campaign_product_link: row.campaign_product_link ? String(row.campaign_product_link) : undefined,
    status: String(row.status || "draft") as AffiliateCampaign["status"],
    created_by: row.created_by ? String(row.created_by) : undefined,
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || "")
  };
}

function campaignApplicationFromRow(row: Record<string, unknown>): CampaignApplication {
  return {
    id: String(row.id),
    campaign_id: String(row.campaign_id),
    creator_id: String(row.creator_id),
    status: String(row.status || "applied") as CampaignApplication["status"],
    application_message: String(row.application_message || ""),
    applied_at: String(row.applied_at || ""),
    reviewed_at: row.reviewed_at ? String(row.reviewed_at) : undefined,
    reviewed_by: row.reviewed_by ? String(row.reviewed_by) : undefined,
    rejection_reason: row.rejection_reason ? String(row.rejection_reason) : undefined,
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || "")
  };
}

function eventProductFromRow(row: Record<string, unknown>): EventProduct {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    product_id: String(row.product_id),
    available_quantity: Number(row.available_quantity || 0),
    max_claims_per_creator: Number(row.max_claims_per_creator || 1),
    status: String(row.status || "active") as EventProduct["status"]
  };
}

function claimFromRow(row: Record<string, unknown>): SampleClaim {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    creator_id: String(row.creator_id),
    seller_id: String(row.seller_id),
    brand_id: String(row.brand_id),
    product_id: String(row.product_id),
    quantity: Number(row.quantity || 1),
    claimed_at: String(row.claimed_at || ""),
    claimed_by: String(row.claimed_by || "Seller Staff"),
    booth_id: row.booth_id ? String(row.booth_id) : undefined,
    qr_scan_id: row.qr_scan_id ? String(row.qr_scan_id) : undefined,
    status: String(row.status || "claimed") as SampleClaim["status"]
  };
}

async function listDbEventsUncached() {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select(
      eventSelect
    )
    .order("event_date", { ascending: false });

  if (error) {
    console.error("Failed to load Supabase events", error);
    return null;
  }

  return data.map(eventFromRow);
}

const listDbEvents = cache(listDbEventsUncached);

async function loadDbStateUncached(): Promise<DemoState | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const [
    events,
    sellers,
    eventSellers,
    creators,
    responses,
    registrations,
    attendance,
    qrs,
    brands,
    products,
    eventProducts,
    claims,
    sellerInvites
  ] = await Promise.all([
    supabase.from("events").select(eventSelect).order("event_date", { ascending: false }),
    supabase.from("sellers").select(sellerSelect).order("created_at", { ascending: false }),
    supabase.from("event_sellers").select("id,event_id,seller_id,booth_name,booth_number,status"),
    supabase
      .from("creators")
      .select("id,full_name,tiktok_username,tiktok_profile_url,email,mobile,location,follower_count,gmv_max_total,creator_category,content_categories,affiliate_experience,profile_image,notes")
      .order("created_at", { ascending: false }),
    supabase.from("event_form_responses").select("id,event_id,creator_id,form_version_id,field_snapshot,answers,submitted_at"),
    supabase.from("event_registrations").select("id,event_id,creator_id,form_response_id,registration_status,registered_at,approved_at,notes"),
    supabase.from("event_attendance").select("id,event_id,creator_id,registration_id,status,checked_in_at,checked_in_by"),
    supabase.from("creator_event_qr").select("id,event_id,creator_id,registration_id,attendance_id,qr_token,qr_url,status,generated_at,last_scanned_at"),
    supabase.from("brands").select("id,seller_id,brand_name,logo_url,description,status"),
    supabase.from("products").select(productSelect),
    supabase.from("event_products").select("id,event_id,product_id,available_quantity,max_claims_per_creator,status"),
    supabase.from("sample_claims").select("id,event_id,creator_id,seller_id,brand_id,product_id,quantity,claimed_at,claimed_by,booth_id,qr_scan_id,status"),
    supabase.from("seller_invites").select("id,seller_id,username,email,login_url,temporary_password,created_at,status")
  ]);

  const error = [
    events.error,
    sellers.error,
    eventSellers.error,
    creators.error,
    responses.error,
    registrations.error,
    attendance.error,
    qrs.error,
    brands.error,
    products.error,
    eventProducts.error,
    claims.error,
    sellerInvites.error
  ].find(Boolean);

  if (error) {
    console.error("Failed to load Supabase data", error);
    return null;
  }

  return {
    events: (events.data || []).map(eventFromRow),
    sellers: (sellers.data || []).map(sellerFromRow),
    eventSellers: (eventSellers.data || []).map(eventSellerFromRow),
    creators: (creators.data || []).map(creatorFromRow),
    responses: (responses.data || []).map(formResponseFromRow),
    registrations: (registrations.data || []).map(registrationFromRow),
    attendance: (attendance.data || []).map(attendanceFromRow),
    qrs: (qrs.data || []).map(qrFromRow),
    brands: (brands.data || []).map(brandFromRow),
    products: (products.data || []).map(productFromRow),
    eventProducts: (eventProducts.data || []).map(eventProductFromRow),
    claims: (claims.data || []).map(claimFromRow),
    sellerInvites: (sellerInvites.data || []).map((invite) => ({
      id: String(invite.id),
      seller_id: String(invite.seller_id),
      username: invite.username ? String(invite.username) : undefined,
      email: String(invite.email),
      login_url: String(invite.login_url),
      temporary_password: String(invite.temporary_password),
      created_at: String(invite.created_at),
      status: String(invite.status || "queued") as SellerInvite["status"]
    })),
    forms: []
  };
}

const loadDbState = cache(loadDbStateUncached);

async function ensureOrganization() {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { error } = await supabase.from("organizations").upsert({
    id: defaultOrganizationId,
    name: "TAP Philippines"
  });
  if (error) throw error;

  return supabase;
}

declare global {
  var tapDemoState: DemoState | undefined;
}

function state(): DemoState {
  if (!global.tapDemoState) {
    global.tapDemoState = {
      events: structuredClone([demoEvent]),
      sellers: structuredClone([demoSeller]),
      eventSellers: structuredClone([demoEventSeller]),
      creators: structuredClone(demoCreators),
      responses: structuredClone(demoResponses),
      registrations: structuredClone(demoRegistrations),
      attendance: structuredClone(demoAttendance),
      qrs: structuredClone(demoQr),
      brands: structuredClone(demoBrands),
      products: structuredClone(demoProducts),
      eventProducts: structuredClone(demoEventProducts),
      claims: structuredClone(demoClaims),
      sellerInvites: [],
      forms: structuredClone([demoForm])
    };
  }

  if (!global.tapDemoState.events) {
    global.tapDemoState.events = structuredClone([demoEvent]);
  }
  if (!global.tapDemoState.brands) {
    global.tapDemoState.brands = structuredClone(demoBrands);
  }
  if (!global.tapDemoState.products) {
    global.tapDemoState.products = structuredClone(demoProducts);
  }
  if (!global.tapDemoState.sellers) {
    global.tapDemoState.sellers = structuredClone([demoSeller]);
  }
  if (!global.tapDemoState.eventSellers) {
    global.tapDemoState.eventSellers = structuredClone([demoEventSeller]);
  }
  if (!global.tapDemoState.sellerInvites) {
    global.tapDemoState.sellerInvites = [];
  }
  if (!global.tapDemoState.forms) {
    global.tapDemoState.forms = structuredClone([demoForm]);
  }

  return global.tapDemoState;
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mapById<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function mapBy<T>(rows: T[], key: (row: T) => string) {
  return new Map(rows.map((row) => [key(row), row]));
}

function creatorMaxGmvFromAnswers(answers: Record<string, unknown>) {
  return Math.max(
    Number(answers.gmv_max_total || 0),
    Number(answers.tiktok_last_month_gmv || 0),
    Number(answers.shopee_last_month_gmv || 0)
  );
}

function ensureCreatorQr(registration: Registration, status?: CreatorQr["status"]) {
  const s = state();
  let qr = s.qrs.find((item) => item.event_id === registration.event_id && item.creator_id === registration.creator_id);

  if (!qr) {
    const token = `tap_${crypto.randomUUID().replaceAll("-", "")}`;
    qr = {
      id: uid("qr"),
      event_id: registration.event_id,
      creator_id: registration.creator_id,
      registration_id: registration.id,
      qr_token: token,
      qr_url: appUrl(`/qr/${token}`),
      status: status || "pending_approval",
      generated_at: new Date().toISOString()
    };
    s.qrs.unshift(qr);
  } else if (status) {
    qr.status = status;
  }

  return qr;
}

export async function listEvents() {
  return (await listDbEvents()) || state().events;
}

export async function listSellerEvents() {
  const s = (await loadDbState()) || state();
  return s.eventSellers.map((eventSeller) => ({
    event: s.events.find((event) => event.id === eventSeller.event_id) || demoEvent,
    eventSeller
  }));
}

export async function removeSellerEvent(eventId: string) {
  if (!eventId) return { ok: false, message: "Event is required." };

  const supabase = createServiceClient();
  if (supabase) {
    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sellerError) return { ok: false, message: sellerError.message };
    if (!seller) return { ok: false, message: "Seller not found." };

    const { data: brands, error: brandsError } = await supabase.from("brands").select("id").eq("seller_id", seller.id);
    if (brandsError) return { ok: false, message: brandsError.message };
    const brandIds = (brands || []).map((brand) => String(brand.id));

    if (brandIds.length) {
      const { data: products, error: productsError } = await supabase.from("products").select("id").in("brand_id", brandIds);
      if (productsError) return { ok: false, message: productsError.message };
      const productIds = (products || []).map((product) => String(product.id));
      if (productIds.length) {
        const { error: eventProductsError } = await supabase.from("event_products").delete().eq("event_id", eventId).in("product_id", productIds);
        if (eventProductsError) return { ok: false, message: eventProductsError.message };
      }
    }

    const { error } = await supabase.from("event_sellers").delete().eq("event_id", eventId).eq("seller_id", seller.id);
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Event removed from your seller account." };
  }

  const s = state();
  const seller = s.sellers[0];
  if (!seller) return { ok: false, message: "Seller not found." };
  const brandIds = s.brands.filter((brand) => brand.seller_id === seller.id).map((brand) => brand.id);
  const productIds = s.products.filter((product) => brandIds.includes(product.brand_id)).map((product) => product.id);
  s.eventProducts = s.eventProducts.filter((eventProduct) => eventProduct.event_id !== eventId || !productIds.includes(eventProduct.product_id));
  s.eventSellers = s.eventSellers.filter((eventSeller) => eventSeller.event_id !== eventId || eventSeller.seller_id !== seller.id);
  return { ok: true, message: "Event removed from your seller account." };
}

export async function getEventBySlug(slug: string) {
  const supabase = createServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("events")
      .select(
        eventSelect
      )
      .eq("event_slug", slug)
      .maybeSingle();
    if (!error && data) return eventFromRow(data);
    if (error) console.error("Failed to load Supabase event by slug", error);
  }

  return state().events.find((event) => event.event_slug === slug) || null;
}

export async function getEventById(id: string) {
  const supabase = createServiceClient();
  if (supabase && isUuid(id)) {
    const { data, error } = await supabase
      .from("events")
      .select(
        eventSelect
      )
      .eq("id", id)
      .maybeSingle();
    if (!error && data) return eventFromRow(data);
    if (error) console.error("Failed to load Supabase event by id", error);
  }

  return state().events.find((event) => event.id === id) || null;
}

async function publishRegistrationFormVersion(eventId: string, fields: FormField[]) {
  const supabase = createServiceClient();
  if (!supabase) return null;

  let formId: string;
  const { data: existingForm, error: formLookupError } = await supabase
    .from("event_forms")
    .select("id,active_version_id")
    .eq("event_id", eventId)
    .maybeSingle();
  if (formLookupError) throw formLookupError;

  if (existingForm?.id) {
    formId = String(existingForm.id);
  } else {
    const { data: form, error: formError } = await supabase.from("event_forms").insert({ event_id: eventId }).select("id").single();
    if (formError) throw formError;
    formId = String(form.id);
  }

  const { data: latestVersion, error: latestVersionError } = await supabase
    .from("event_form_versions")
    .select("version_number")
    .eq("form_id", formId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestVersionError) throw latestVersionError;

  const versionNumber = Number(latestVersion?.version_number || 0) + 1;
  const { data: version, error: versionError } = await supabase
    .from("event_form_versions")
    .insert({
      form_id: formId,
      version_number: versionNumber,
      status: "published",
      published_at: new Date().toISOString()
    })
    .select("id")
    .single();
  if (versionError) throw versionError;

  const versionId = String(version.id);
  const { error: fieldsError } = await supabase.from("event_form_fields").insert(
    fields.map((field, index) => ({
      form_version_id: versionId,
      label: field.label,
      field_key: field.id,
      field_type: field.field_type,
      required: field.required,
      options: field.options || [],
      sort_order: field.sort_order || index + 1
    }))
  );
  if (fieldsError) throw fieldsError;

  if (existingForm?.active_version_id) {
    await supabase
      .from("event_form_versions")
      .update({ status: "archived" })
      .eq("id", existingForm.active_version_id)
      .neq("id", versionId);
  }

  const { error: updateError } = await supabase.from("event_forms").update({ active_version_id: versionId }).eq("id", formId);
  if (updateError) throw updateError;

  return { id: versionId, version_number: versionNumber };
}

export async function getPublishedForm(eventId: string) {
  const event = await getEventById(eventId);
  if (!event) return null;
  const supabase = createServiceClient();
  if (supabase) {
    const { data: existingForm, error: formError } = await supabase
      .from("event_forms")
      .select("id,active_version_id")
      .eq("event_id", eventId)
      .maybeSingle();
    if (formError) throw formError;

    let versionId = existingForm?.active_version_id;

    if (!versionId) {
      const version = await publishRegistrationFormVersion(eventId, defaultRegistrationFields());
      versionId = version?.id;
    }

    if (!versionId) return null;
    const { data: versionRow, error: versionError } = await supabase
      .from("event_form_versions")
      .select("version_number,published_at,status")
      .eq("id", versionId)
      .maybeSingle();
    if (versionError) throw versionError;

    const { data: fields, error: fieldsError } = await supabase
      .from("event_form_fields")
      .select("label,field_key,field_type,required,options,sort_order")
      .eq("form_version_id", versionId)
      .order("sort_order");
    if (fieldsError) throw fieldsError;

    return {
      id: String(versionId),
      event_id: eventId,
      version_number: Number(versionRow?.version_number || 1),
      status: "published",
      published_at: String(versionRow?.published_at || new Date().toISOString()),
      fields: sortRegistrationFields(fields.map((field) => ({
        id: String(field.field_key),
        label: String(field.label),
        field_type: String(field.field_type) as FormField["field_type"],
        required: Boolean(field.required),
        options: Array.isArray(field.options) ? field.options.map(String) : [],
        sort_order: Number(field.sort_order)
      })))
    } satisfies FormVersion;
  }

  const existing = state().forms.find((form) => form.event_id === eventId);
  if (existing) return { ...existing, fields: sortRegistrationFields(existing.fields) };

  const form: FormVersion = {
    id: `formv_${eventId}_1`,
    event_id: eventId,
    version_number: 1,
    status: "published",
    published_at: new Date().toISOString(),
    fields: defaultRegistrationFields()
  };
  state().forms.unshift(form);
  return form;
}

export async function createEvent(formData: FormData, posterUrl?: string) {
  const name = String(formData.get("event_name") || "").trim();
  const eventDate = String(formData.get("event_date") || "").trim();
  const venue = String(formData.get("venue") || "").trim();
  const address = String(formData.get("address") || venue).trim();
  const description = String(formData.get("description") || "").trim();
  const startTime = String(formData.get("start_time") || "10:00");
  const endTime = String(formData.get("end_time") || "17:00");
  const capacity = Number(formData.get("maximum_creator_capacity") || 300);
  const registrationFields = registrationFieldsFromFormData(formData);

  if (!name || !eventDate || !venue) {
    return { ok: false, message: "Event name, date, and location are required." };
  }

  const slugBase = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56);
  const id = crypto.randomUUID();
  const slugCandidate = `${slugBase}-${eventDate}`.replace(/[^a-z0-9-]+/g, "-");
  const existingSlugs = new Set((await listEvents()).map((event) => event.event_slug));
  let eventSlug = slugCandidate;
  let suffix = 2;
  while (existingSlugs.has(eventSlug)) {
    eventSlug = `${slugCandidate}-${suffix}`;
    suffix += 1;
  }

  const event: Event = {
    id,
    event_name: name,
    event_slug: eventSlug,
    description: description || "TAP seller and creator matchmaking event.",
    venue,
    address,
    event_date: eventDate,
    start_time: startTime,
    end_time: endTime,
    registration_start: new Date().toISOString(),
    registration_end: new Date(`${eventDate}T23:59:59`).toISOString(),
    maximum_creator_capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 300,
    poster_url:
      posterUrl ||
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80",
    status: "published"
  };

  const supabase = await ensureOrganization();
  if (supabase) {
    const { data, error } = await supabase
      .from("events")
      .insert({
        id: event.id,
        organization_id: defaultOrganizationId,
        event_name: event.event_name,
        event_slug: event.event_slug,
        description: event.description,
        venue: event.venue,
        address: event.address,
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        registration_start: event.registration_start,
        registration_end: event.registration_end,
        maximum_creator_capacity: event.maximum_creator_capacity,
        poster_url: event.poster_url,
        status: event.status
      })
      .select(
        eventSelect
      )
      .single();

    if (error) return { ok: false, message: error.message };
    try {
      await publishRegistrationFormVersion(event.id, registrationFields);
    } catch (formError) {
      console.error("Failed to create event registration form", formError);
      return { ok: false, message: formError instanceof Error ? formError.message : "Event created, but registration form setup failed." };
    }
    return { ok: true, message: "Event created.", event: eventFromRow(data) };
  }

  state().events.unshift(event);
  state().forms.unshift({
    id: `formv_${event.id}_1`,
    event_id: event.id,
    version_number: 1,
    status: "published",
    published_at: new Date().toISOString(),
    fields: registrationFields
  });
  return { ok: true, message: "Event created.", event };
}

export async function updateEventRegistrationForm(eventId: string, formData: FormData) {
  if (!eventId) return { ok: false, message: "Event is required." };
  const event = await getEventById(eventId);
  if (!event) return { ok: false, message: "Event not found." };

  const fields = registrationFieldsFromFormData(formData);
  if (!fields.length) return { ok: false, message: "Choose at least one registration field." };

  const supabase = createServiceClient();
  if (supabase) {
    try {
      const version = await publishRegistrationFormVersion(eventId, fields);
      return {
        ok: true,
        message: `Registration form updated to version ${version?.version_number || ""}.`.trim(),
        event
      };
    } catch (error) {
      console.error("Failed to update event registration form", error);
      return { ok: false, message: error instanceof Error ? error.message : "Could not update registration form." };
    }
  }

  const s = state();
  const currentVersion = s.forms
    .filter((form) => form.event_id === eventId)
    .reduce((highest, form) => Math.max(highest, form.version_number), 0);
  s.forms = s.forms.map((form) => (form.event_id === eventId ? { ...form, status: "archived" } : form));
  s.forms.unshift({
    id: `formv_${eventId}_${currentVersion + 1}`,
    event_id: eventId,
    version_number: currentVersion + 1,
    status: "published",
    published_at: new Date().toISOString(),
    fields
  });

  return { ok: true, message: `Registration form updated to version ${currentVersion + 1}.`, event };
}

export async function updateEventBanner(eventId: string, posterUrl: string) {
  if (!posterUrl) return { ok: false, message: "Banner image is required." };

  const supabase = createServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("events")
      .update({ poster_url: posterUrl, updated_at: new Date().toISOString() })
      .eq("id", eventId)
      .select(
        eventSelect
      )
      .maybeSingle();

    if (error) return { ok: false, message: error.message };
    if (!data) return { ok: false, message: "Event not found." };
    return { ok: true, message: "Event banner updated.", event: eventFromRow(data) };
  }

  const event = state().events.find((item) => item.id === eventId);
  if (!event) return { ok: false, message: "Event not found." };
  event.poster_url = posterUrl;
  return { ok: true, message: "Event banner updated.", event };
}

export async function updateEventSchedule(formData: FormData) {
  const eventId = String(formData.get("event_id") || "");
  const eventDate = String(formData.get("event_date") || "").trim();
  const startTime = String(formData.get("start_time") || "").trim();
  const endTime = String(formData.get("end_time") || "").trim();

  if (!eventId) return { ok: false, message: "Event is required." };
  if (!eventDate || !startTime || !endTime) return { ok: false, message: "Event date, start time, and end time are required." };
  if (startTime >= endTime) return { ok: false, message: "End time must be later than start time." };

  const registrationEnd = new Date(`${eventDate}T23:59:59`).toISOString();
  const supabase = createServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("events")
      .update({
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        registration_end: registrationEnd,
        updated_at: new Date().toISOString()
      })
      .eq("id", eventId)
      .select(eventSelect)
      .maybeSingle();

    if (error) return { ok: false, message: error.message };
    if (!data) return { ok: false, message: "Event not found." };
    return { ok: true, message: "Event date and time updated.", event: eventFromRow(data) };
  }

  const event = state().events.find((item) => item.id === eventId);
  if (!event) return { ok: false, message: "Event not found." };
  event.event_date = eventDate;
  event.start_time = startTime;
  event.end_time = endTime;
  event.registration_end = registrationEnd;
  return { ok: true, message: "Event date and time updated.", event };
}

export async function deleteEvent(eventId: string) {
  if (!eventId) return { ok: false, message: "Event is required." };

  const supabase = createServiceClient();
  if (supabase) {
    const { data: event, error: eventError } = await supabase.from("events").select("id,event_name").eq("id", eventId).maybeSingle();
    if (eventError) return { ok: false, message: eventError.message };
    if (!event) return { ok: false, message: "Event not found." };

    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) return { ok: false, message: error.message };

    return { ok: true, message: `${event.event_name} deleted.` };
  }

  const s = state();
  const eventIndex = s.events.findIndex((event) => event.id === eventId);
  if (eventIndex === -1) return { ok: false, message: "Event not found." };

  const [event] = s.events.splice(eventIndex, 1);
  s.eventSellers = s.eventSellers.filter((item) => item.event_id !== eventId);
  s.eventProducts = s.eventProducts.filter((item) => item.event_id !== eventId);
  s.registrations = s.registrations.filter((item) => item.event_id !== eventId);
  s.responses = s.responses.filter((item) => item.event_id !== eventId);
  s.attendance = s.attendance.filter((item) => item.event_id !== eventId);
  s.qrs = s.qrs.filter((item) => item.event_id !== eventId);
  s.claims = s.claims.filter((item) => item.event_id !== eventId);

  return { ok: true, message: `${event.event_name} deleted.` };
}

export async function deleteSeller(sellerId: string) {
  if (!sellerId) return { ok: false, message: "Seller is required." };

  const supabase = createServiceClient();
  if (supabase) {
    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .select("id,company_name")
      .eq("id", sellerId)
      .maybeSingle();
    if (sellerError) return { ok: false, message: sellerError.message };
    if (!seller) return { ok: false, message: "Seller not found." };

    const { data: brandRows, error: brandError } = await supabase.from("brands").select("id").eq("seller_id", sellerId);
    if (brandError) return { ok: false, message: brandError.message };
    const brandIds = (brandRows || []).map((brand) => String(brand.id));

    const { data: productRows, error: productError } = brandIds.length
      ? await supabase.from("products").select("id").in("brand_id", brandIds)
      : { data: [], error: null };
    if (productError) return { ok: false, message: productError.message };
    const productIds = (productRows || []).map((product) => String(product.id));

    if (productIds.length) {
      const { error } = await supabase.from("sample_claims").delete().in("product_id", productIds);
      if (error) return { ok: false, message: error.message };
    }

    const { error: sellerClaimsError } = await supabase.from("sample_claims").delete().eq("seller_id", sellerId);
    if (sellerClaimsError) return { ok: false, message: sellerClaimsError.message };

    const { error: scansError } = await supabase.from("qr_scans").delete().eq("seller_id", sellerId);
    if (scansError) return { ok: false, message: scansError.message };

    const { error } = await supabase.from("sellers").delete().eq("id", sellerId);
    if (error) return { ok: false, message: error.message };

    return { ok: true, message: `${seller.company_name} deleted.` };
  }

  const s = state();
  const sellerIndex = s.sellers.findIndex((seller) => seller.id === sellerId);
  if (sellerIndex === -1) return { ok: false, message: "Seller not found." };

  const [seller] = s.sellers.splice(sellerIndex, 1);
  const brandIds = s.brands.filter((brand) => brand.seller_id === sellerId).map((brand) => brand.id);
  const productIds = s.products.filter((product) => brandIds.includes(product.brand_id)).map((product) => product.id);
  s.claims = s.claims.filter((claim) => claim.seller_id !== sellerId && !productIds.includes(claim.product_id));
  s.eventSellers = s.eventSellers.filter((eventSeller) => eventSeller.seller_id !== sellerId);
  s.eventProducts = s.eventProducts.filter((eventProduct) => !productIds.includes(eventProduct.product_id));
  s.products = s.products.filter((product) => !productIds.includes(product.id));
  s.brands = s.brands.filter((brand) => brand.seller_id !== sellerId);
  s.sellerInvites = s.sellerInvites.filter((invite) => invite.seller_id !== sellerId);

  return { ok: true, message: `${seller.company_name} deleted.` };
}

export async function updateSeller(formData: FormData, logoUrl?: string) {
  const sellerId = String(formData.get("seller_id") || "");
  const eventId = String(formData.get("event_id") || "");
  const sellerName = String(formData.get("seller_name") || "").trim();
  const contactName = String(formData.get("contact_name") || sellerName).trim();
  const username = normalizeSellerUsername(String(formData.get("username") || "").trim());
  const email = sellerUsernameToAuthEmail(username);
  const phone = String(formData.get("phone") || "").trim();
  const shopCode = String(formData.get("shop_code") || "").trim();
  const shopLink = String(formData.get("shop_link") || "").trim();
  const openPlanCommission = Number(formData.get("open_plan_commission") || 0);
  const tapCommission = Number(formData.get("tap_commission") || 0);
  const status = String(formData.get("status") || "active") === "inactive" ? "inactive" : "active";
  const boothName = String(formData.get("booth_name") || sellerName).trim();
  const boothNumber = String(formData.get("booth_number") || "").trim();

  if (!sellerId || !sellerName || !username) {
    return { ok: false, message: "Seller name and username are required." };
  }

  const supabase = createServiceClient();
  if (supabase) {
    const updatePayload: Record<string, string | number | null> = {
      company_name: sellerName,
      contact_name: contactName,
      username,
      email,
      phone,
      shop_code: shopCode || null,
      shop_link: shopLink || null,
      open_plan_commission: Number.isFinite(openPlanCommission) ? openPlanCommission : 0,
      tap_commission: Number.isFinite(tapCommission) ? tapCommission : 0,
      status
    };
    if (logoUrl) updatePayload.logo_url = logoUrl;

    const { data: usernameConflict, error: usernameError } = await supabase
      .from("sellers")
      .select("id")
      .ilike("username", username)
      .neq("id", sellerId)
      .limit(1);
    if (usernameError) return { ok: false, message: usernameError.message };
    if (usernameConflict?.length) return { ok: false, message: "That seller username is already in use." };

    const { data: seller, error } = await supabase
      .from("sellers")
      .update(updatePayload)
      .eq("id", sellerId)
      .select(sellerSelect)
      .maybeSingle();
    if (error) return { ok: false, message: error.message };
    if (!seller) return { ok: false, message: "Seller not found." };

    if (eventId) {
      if (!boothNumber) return { ok: false, message: "Booth number is required." };
      const { data: conflict, error: conflictError } = await supabase
        .from("event_sellers")
        .select("id")
        .eq("event_id", eventId)
        .ilike("booth_number", boothNumber)
        .neq("seller_id", sellerId)
        .limit(1);
      if (conflictError) return { ok: false, message: conflictError.message };
      if (conflict?.length) return { ok: false, message: "That booth number is already assigned for this event." };

      const { error: eventSellerError } = await supabase
        .from("event_sellers")
        .update({
          booth_name: boothName,
          booth_number: boothNumber,
          status
        })
        .eq("event_id", eventId)
        .eq("seller_id", sellerId);
      if (eventSellerError) return { ok: false, message: eventSellerError.message };
    }

    return { ok: true, message: "Seller updated.", seller: sellerFromRow(seller) };
  }

  const s = state();
  const seller = s.sellers.find((item) => item.id === sellerId);
  if (!seller) return { ok: false, message: "Seller not found." };
  if (s.sellers.some((item) => item.id !== sellerId && item.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, message: "That seller username is already in use." };
  }

  seller.company_name = sellerName;
  seller.contact_name = contactName;
  seller.username = username;
  seller.email = email;
  seller.phone = phone;
  seller.shop_code = shopCode || undefined;
  seller.shop_link = shopLink || undefined;
  seller.open_plan_commission = Number.isFinite(openPlanCommission) ? openPlanCommission : 0;
  seller.tap_commission = Number.isFinite(tapCommission) ? tapCommission : 0;
  seller.status = status;
  if (logoUrl) seller.logo_url = logoUrl;

  if (eventId) {
    if (!boothNumber) return { ok: false, message: "Booth number is required." };
    const conflict = s.eventSellers.find(
      (eventSeller) =>
        eventSeller.event_id === eventId &&
        eventSeller.seller_id !== sellerId &&
        eventSeller.booth_number.toLowerCase() === boothNumber.toLowerCase()
    );
    if (conflict) return { ok: false, message: "That booth number is already assigned for this event." };

    const eventSeller = s.eventSellers.find((item) => item.event_id === eventId && item.seller_id === sellerId);
    if (eventSeller) {
      eventSeller.booth_name = boothName;
      eventSeller.booth_number = boothNumber;
      eventSeller.status = status;
    }
  }

  return { ok: true, message: "Seller updated.", seller };
}

export async function listEventSellerRows(eventId: string) {
  const s = (await loadDbState()) || state();
  return s.eventSellers
    .filter((eventSeller) => eventSeller.event_id === eventId)
    .map((eventSeller) => {
      const seller = s.sellers.find((item) => item.id === eventSeller.seller_id)!;
      const brands = s.brands.filter((brand) => brand.seller_id === seller.id);
      const products = s.products.filter((product) => brands.some((brand) => brand.id === product.brand_id));
      const eventProducts = s.eventProducts.filter(
        (eventProduct) => eventProduct.event_id === eventId && products.some((product) => product.id === eventProduct.product_id)
      );
      const claims = s.claims.filter((claim) => claim.event_id === eventId && claim.seller_id === seller.id && claim.status === "claimed");
      const invite = s.sellerInvites.find((item) => item.seller_id === seller.id);

      return { eventSeller, seller, brands, products, eventProducts, claims, invite };
    });
}

export async function listSellerDatabaseRows(query = "") {
  const needle = query.trim().toLowerCase();
  const supabase = createServiceClient();
  if (supabase) {
    const { data: sellerRows, error } = await supabase
      .from("sellers")
      .select(sellerSelect)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load sellers database", error);
      return [];
    }

    const sellers = (sellerRows || []).map(sellerFromRow);
    if (!sellers.length) return [];
    const sellerIds = unique(sellers.map((seller) => seller.id));

    const [eventSellersResult, brandsResult, claimsResult, invitesResult] = await Promise.all([
      supabase.from("event_sellers").select("id,event_id,seller_id,booth_name,booth_number,status").in("seller_id", sellerIds),
      supabase.from("brands").select("id,seller_id,brand_name,logo_url,description,status").in("seller_id", sellerIds),
      supabase
        .from("sample_claims")
        .select("id,event_id,creator_id,seller_id,brand_id,product_id,quantity,claimed_at,claimed_by,booth_id,qr_scan_id,status")
        .in("seller_id", sellerIds)
        .eq("status", "claimed"),
      supabase.from("seller_invites").select("id,seller_id,username,email,login_url,temporary_password,created_at,status").in("seller_id", sellerIds)
    ]);

    const eventSellers = (eventSellersResult.data || []).map(eventSellerFromRow);
    const brands = (brandsResult.data || []).map(brandFromRow);
    const claims = (claimsResult.data || []).map(claimFromRow);
    const invites = (invitesResult.data || []).map((invite) => ({
      id: String(invite.id),
      seller_id: String(invite.seller_id),
      username: invite.username ? String(invite.username) : undefined,
      email: String(invite.email),
      login_url: String(invite.login_url),
      temporary_password: String(invite.temporary_password),
      created_at: String(invite.created_at),
      status: String(invite.status || "queued") as SellerInvite["status"]
    }));

    const brandIds = unique(brands.map((brand) => brand.id));
    const [productsResult, eventsResult] = await Promise.all([
      brandIds.length
        ? supabase
          .from("products")
          .select(productSelect)
          .in("brand_id", brandIds)
        : Promise.resolve({ data: [], error: null }),
      eventSellers.length ? supabase.from("events").select(eventSelect).in("id", unique(eventSellers.map((item) => item.event_id))) : Promise.resolve({ data: [], error: null })
    ]);

    const products = (productsResult.data || []).map(productFromRow);
    const events = (eventsResult.data || []).map(eventFromRow);

    return sellers
      .map((seller) => {
        const sellerBrands = brands.filter((brand) => brand.seller_id === seller.id);
        const sellerEventSellers = eventSellers.filter((eventSeller) => eventSeller.seller_id === seller.id);
        return {
          seller,
          brands: sellerBrands,
          products: products.filter((product) => sellerBrands.some((brand) => brand.id === product.brand_id)),
          eventSellers: sellerEventSellers,
          events: sellerEventSellers.map((eventSeller) => events.find((event) => event.id === eventSeller.event_id)).filter(Boolean) as Event[],
          claims: claims.filter((claim) => claim.seller_id === seller.id),
          invite: invites.find((invite) => invite.seller_id === seller.id)
        };
      })
      .filter(({ seller, brands, events }) => {
        if (!needle) return true;
        return [
          seller.company_name,
          seller.contact_name,
          seller.username,
          seller.email,
          seller.phone,
          ...brands.map((brand) => brand.brand_name),
          ...events.map((event) => event.event_name)
        ].some((value) => value.toLowerCase().includes(needle));
      });
  }

  const s = state();
  return s.sellers
    .map((seller) => {
      const brands = s.brands.filter((brand) => brand.seller_id === seller.id);
      const eventSellers = s.eventSellers.filter((eventSeller) => eventSeller.seller_id === seller.id);
      return {
        seller,
        brands,
        products: s.products.filter((product) => brands.some((brand) => brand.id === product.brand_id)),
        eventSellers,
        events: eventSellers.map((eventSeller) => s.events.find((event) => event.id === eventSeller.event_id)).filter(Boolean) as Event[],
        claims: s.claims.filter((claim) => claim.seller_id === seller.id && claim.status === "claimed"),
        invite: s.sellerInvites.find((invite) => invite.seller_id === seller.id)
      };
    })
    .filter(({ seller, brands, events }) => {
      if (!needle) return true;
      return [
        seller.company_name,
        seller.contact_name,
        seller.username,
        seller.email,
        seller.phone,
        ...brands.map((brand) => brand.brand_name),
        ...events.map((event) => event.event_name)
      ].some((value) => value.toLowerCase().includes(needle));
    });
}

export async function getSellerDetail(sellerId: string) {
  const rows = await listSellerDatabaseRows();
  return rows.find((row) => row.seller.id === sellerId) || null;
}

export async function listCampaignBrandOptions() {
  const supabase = createServiceClient();
  if (supabase) {
    const { data: brands, error: brandsError } = await supabase.from("brands").select("id,seller_id,brand_name,logo_url,description,status").order("brand_name");
    if (brandsError) {
      console.error("Failed to load campaign brand options", brandsError);
      return [];
    }
    const brandRows = (brands || []).map(brandFromRow);
    const sellerIds = unique(brandRows.map((brand) => brand.seller_id));
    const { data: sellers } = sellerIds.length ? await supabase.from("sellers").select(sellerSelect).in("id", sellerIds) : { data: [] };
    const sellerRows = mapById((sellers || []).map(sellerFromRow));
    return brandRows.map((brand) => ({ brand, seller: sellerRows.get(brand.seller_id) || demoSeller }));
  }

  const s = state();
  return s.brands.map((brand) => ({ brand, seller: s.sellers.find((seller) => seller.id === brand.seller_id) || demoSeller }));
}

function campaignSlugFromName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function campaignLinksFromFormData(formData: FormData) {
  return String(formData.get("sample_video_links") || "")
    .split(/\r?\n|,/)
    .map((link) => link.trim())
    .filter(Boolean);
}

export async function listAdminCampaigns() {
  const supabase = createServiceClient();
  if (supabase) {
    const { data, error } = await supabase.from("affiliate_campaigns").select(campaignSelect).order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load campaigns", error);
      return [];
    }
    const campaigns = (data || []).map(campaignFromRow);
    if (!campaigns.length) return [];
    const brandIds = unique(campaigns.map((campaign) => campaign.brand_id));
    const campaignIds = unique(campaigns.map((campaign) => campaign.id));
    const [brandsResult, applicationsResult] = await Promise.all([
      supabase.from("brands").select("id,seller_id,brand_name,logo_url,description,status").in("id", brandIds),
      supabase.from("campaign_applications").select("id,campaign_id,creator_id,status,application_message,applied_at,reviewed_at,reviewed_by,rejection_reason,created_at,updated_at").in("campaign_id", campaignIds)
    ]);
    const brands = (brandsResult.data || []).map(brandFromRow);
    const sellerIds = unique(brands.map((brand) => brand.seller_id));
    const { data: sellerRows } = sellerIds.length ? await supabase.from("sellers").select(sellerSelect).in("id", sellerIds) : { data: [] };
    const sellers = mapById((sellerRows || []).map(sellerFromRow));
    const brandMap = mapById(brands);
    const applications = (applicationsResult.data || []).map(campaignApplicationFromRow);
    const creatorIds = unique(applications.map((application) => application.creator_id));
    const { data: creatorRows } = creatorIds.length
      ? await supabase
        .from("creators")
        .select("id,full_name,tiktok_username,tiktok_profile_url,email,mobile,location,follower_count,gmv_max_total,creator_category,content_categories,affiliate_experience,profile_image,notes")
        .in("id", creatorIds)
      : { data: [] };
    const creators = mapById((creatorRows || []).map(creatorFromRow));

    return campaigns.map((campaign) => {
      const brand = brandMap.get(campaign.brand_id);
      const campaignApplications = applications.filter((application) => application.campaign_id === campaign.id);
      return {
        campaign,
        brand,
        seller: brand ? sellers.get(brand.seller_id) : undefined,
        applications: campaignApplications,
        applicationRows: campaignApplications.map((application) => ({
          application,
          creator: creators.get(application.creator_id)
        }))
      };
    });
  }

  const s = state();
  return (s.campaigns || []).map((campaign) => {
    const brand = s.brands.find((item) => item.id === campaign.brand_id);
    const campaignApplications = (s.campaignApplications || []).filter((application) => application.campaign_id === campaign.id);
    return {
      campaign,
      brand,
      seller: brand ? s.sellers.find((seller) => seller.id === brand.seller_id) : undefined,
      applications: campaignApplications,
      applicationRows: campaignApplications.map((application) => ({
        application,
        creator: s.creators.find((creator) => creator.id === application.creator_id)
      }))
    };
  });
}

export async function getCampaignDetail(campaignId: string) {
  const rows = await listAdminCampaigns();
  return rows.find((row) => row.campaign.id === campaignId) || null;
}

export async function saveCampaign(formData: FormData, userId?: string) {
  const campaignId = String(formData.get("campaign_id") || "");
  const campaignName = String(formData.get("campaign_name") || "").trim();
  const brandId = String(formData.get("brand_id") || "");
  const status = String(formData.get("status") || "draft") as AffiliateCampaign["status"];
  const openPlanCommission = Number(formData.get("open_plan_commission") || 0);
  const mechanics = String(formData.get("campaign_mechanics") || "").trim();
  const requirements = String(formData.get("campaign_requirements") || "").trim();
  const assetsUrl = String(formData.get("campaign_assets_url") || "").trim();
  const productLink = String(formData.get("campaign_product_link") || "").trim();
  const sampleVideoLinks = campaignLinksFromFormData(formData);

  if (!campaignName || !brandId) return { ok: false, message: "Campaign name and brand are required." };
  if (!Number.isFinite(openPlanCommission) || openPlanCommission < 0) return { ok: false, message: "Commission must be a valid percentage." };

  const supabase = createServiceClient();
  if (supabase) {
    const slugBase = campaignSlugFromName(campaignName);
    const existingCampaigns = campaignId ? [] : await listAdminCampaigns();
    const existingSlugs = new Set(existingCampaigns.map(({ campaign }) => campaign.campaign_slug));
    let slug = slugBase || `campaign-${Date.now()}`;
    let suffix = 2;
    while (existingSlugs.has(slug)) {
      slug = `${slugBase}-${suffix}`;
      suffix += 1;
    }

    const payload = {
      campaign_name: campaignName,
      brand_id: brandId,
      open_plan_commission: openPlanCommission,
      campaign_mechanics: mechanics,
      campaign_requirements: requirements,
      campaign_assets_url: assetsUrl || null,
      sample_video_links: sampleVideoLinks,
      campaign_product_link: productLink || null,
      status,
      updated_at: new Date().toISOString()
    };

    const query = campaignId
      ? supabase.from("affiliate_campaigns").update(payload).eq("id", campaignId).select(campaignSelect).maybeSingle()
      : supabase
        .from("affiliate_campaigns")
        .insert({
          ...payload,
          organization_id: defaultOrganizationId,
          campaign_slug: slug,
          created_by: userId || null
        })
        .select(campaignSelect)
        .single();

    const { data, error } = await query;
    if (error) return { ok: false, message: error.message };
    if (!data) return { ok: false, message: "Campaign not found." };
    return { ok: true, message: campaignId ? "Campaign updated." : "Campaign created.", campaign: campaignFromRow(data) };
  }

  const s = state();
  const existing = campaignId ? s.campaigns?.find((campaign) => campaign.id === campaignId) : undefined;
  const now = new Date().toISOString();
  if (existing) {
    Object.assign(existing, {
      campaign_name: campaignName,
      brand_id: brandId,
      open_plan_commission: openPlanCommission,
      campaign_mechanics: mechanics,
      campaign_requirements: requirements,
      campaign_assets_url: assetsUrl || undefined,
      sample_video_links: sampleVideoLinks,
      campaign_product_link: productLink || undefined,
      status,
      updated_at: now
    });
    return { ok: true, message: "Campaign updated.", campaign: existing };
  }

  const campaign: AffiliateCampaign = {
    id: uid("cmp"),
    organization_id: defaultOrganizationId,
    campaign_name: campaignName,
    campaign_slug: campaignSlugFromName(campaignName) || uid("campaign"),
    brand_id: brandId,
    open_plan_commission: openPlanCommission,
    campaign_mechanics: mechanics,
    campaign_requirements: requirements,
    campaign_assets_url: assetsUrl || undefined,
    sample_video_links: sampleVideoLinks,
    campaign_product_link: productLink || undefined,
    status,
    created_by: userId,
    created_at: now,
    updated_at: now
  };
  s.campaigns = [campaign, ...(s.campaigns || [])];
  return { ok: true, message: "Campaign created.", campaign };
}

export async function addExistingSellerToEvent(formData: FormData) {
  const eventId = String(formData.get("event_id") || "");
  const sellerId = String(formData.get("seller_id") || "");
  const boothNumber = String(formData.get("booth_number") || "").trim();
  const boothName = String(formData.get("booth_name") || "").trim();

  if (!eventId || !sellerId || !boothNumber) {
    return { ok: false, message: "Seller, event, and booth number are required." };
  }

  const supabase = createServiceClient();
  if (supabase) {
    if (!(await getEventById(eventId))) return { ok: false, message: "Event not found." };

    const { data: seller, error: sellerError } = await supabase.from("sellers").select(sellerSelect).eq("id", sellerId).maybeSingle();
    if (sellerError) return { ok: false, message: sellerError.message };
    if (!seller) return { ok: false, message: "Seller not found." };

    const { data: existingSeller, error: existingSellerError } = await supabase
      .from("event_sellers")
      .select("id")
      .eq("event_id", eventId)
      .eq("seller_id", sellerId)
      .limit(1);
    if (existingSellerError) return { ok: false, message: existingSellerError.message };
    if (existingSeller?.length) return { ok: false, message: "This seller is already assigned to this event." };

    const { data: boothConflict, error: boothError } = await supabase
      .from("event_sellers")
      .select("id")
      .eq("event_id", eventId)
      .ilike("booth_number", boothNumber)
      .limit(1);
    if (boothError) return { ok: false, message: boothError.message };
    if (boothConflict?.length) return { ok: false, message: "That booth number is already assigned for this event." };

    const sellerRow = sellerFromRow(seller);
    const { error: eventSellerError } = await supabase.from("event_sellers").insert({
      event_id: eventId,
      seller_id: sellerId,
      booth_name: boothName || sellerRow.company_name,
      booth_number: boothNumber,
      status: "active"
    });
    if (eventSellerError) return { ok: false, message: eventSellerError.message };

    const { data: brands, error: brandsError } = await supabase.from("brands").select("id").eq("seller_id", sellerId);
    if (brandsError) return { ok: false, message: brandsError.message };
    const brandIds = (brands || []).map((brand) => String(brand.id));

    if (brandIds.length) {
      const { data: products, error: productsError } = await supabase.from("products").select(productSelect).in("brand_id", brandIds);
      if (productsError) return { ok: false, message: productsError.message };
      const eventProducts = (products || []).map((product) => {
        const parsed = productFromRow(product);
        return {
          event_id: eventId,
          product_id: parsed.id,
          available_quantity: parsed.sample_inventory,
          max_claims_per_creator: parsed.max_claims_per_creator,
          status: "active"
        };
      });
      if (eventProducts.length) {
        const { error: eventProductsError } = await supabase.from("event_products").upsert(eventProducts, { onConflict: "event_id,product_id" });
        if (eventProductsError) return { ok: false, message: eventProductsError.message };
      }
    }

    return { ok: true, message: `${sellerRow.company_name} added to this event.` };
  }

  const s = state();
  if (!s.events.some((event) => event.id === eventId)) return { ok: false, message: "Event not found." };
  const seller = s.sellers.find((item) => item.id === sellerId);
  if (!seller) return { ok: false, message: "Seller not found." };
  if (s.eventSellers.some((eventSeller) => eventSeller.event_id === eventId && eventSeller.seller_id === sellerId)) {
    return { ok: false, message: "This seller is already assigned to this event." };
  }
  if (s.eventSellers.some((eventSeller) => eventSeller.event_id === eventId && eventSeller.booth_number.toLowerCase() === boothNumber.toLowerCase())) {
    return { ok: false, message: "That booth number is already assigned for this event." };
  }

  s.eventSellers.unshift({
    id: uid("evs"),
    event_id: eventId,
    seller_id: seller.id,
    booth_name: boothName || seller.company_name,
    booth_number: boothNumber,
    status: "active"
  });

  const brandIds = s.brands.filter((brand) => brand.seller_id === seller.id).map((brand) => brand.id);
  const products = s.products.filter((product) => brandIds.includes(product.brand_id));
  for (const product of products) {
    if (s.eventProducts.some((eventProduct) => eventProduct.event_id === eventId && eventProduct.product_id === product.id)) continue;
    s.eventProducts.unshift({
      id: uid("evp"),
      event_id: eventId,
      product_id: product.id,
      available_quantity: product.sample_inventory,
      max_claims_per_creator: product.max_claims_per_creator,
      status: "active"
    });
  }

  return { ok: true, message: `${seller.company_name} added to this event.` };
}

export async function addEventSeller(formData: FormData, logoUrl?: string) {
  const eventId = String(formData.get("event_id") || "");
  const sellerName = String(formData.get("seller_name") || "").trim();
  const username = normalizeSellerUsername(String(formData.get("username") || "").trim());
  const email = sellerUsernameToAuthEmail(username);
  const boothNumber = String(formData.get("booth_number") || "").trim();
  const boothName = String(formData.get("booth_name") || sellerName).trim();
  const password = String(formData.get("password") || "").trim();
  const shopCode = String(formData.get("shop_code") || "").trim();
  const shopLink = String(formData.get("shop_link") || "").trim();
  const openPlanCommission = Number(formData.get("open_plan_commission") || 0);
  const tapCommission = Number(formData.get("tap_commission") || 0);
  const productBrands = formData.getAll("product_brand").map((value) => String(value).trim());
  const productNames = formData.getAll("product_name").map((value) => String(value).trim());
  const productPids = formData.getAll("product_pid").map((value) => String(value).trim());
  const productLinks = formData.getAll("product_link").map((value) => String(value).trim());
  const productQuantities = formData.getAll("product_quantity").map((value) => Number(value || 0));
  const brandNames = unique(productBrands.filter(Boolean));
  if (!brandNames.length) brandNames.push(`${sellerName} Brand`);

  if (!eventId || !sellerName || !username || !boothNumber || !password) {
    return { ok: false, message: "Seller name, username, password, event, and booth number are required." };
  }

  const supabase = createServiceClient();
  if (supabase) {
    if (!(await getEventById(eventId))) return { ok: false, message: "Event not found." };

    const { data: boothConflict, error: boothError } = await supabase
      .from("event_sellers")
      .select("id")
      .eq("event_id", eventId)
      .ilike("booth_number", boothNumber)
      .limit(1);
    if (boothError) return { ok: false, message: boothError.message };
    if (boothConflict?.length) return { ok: false, message: "That booth number is already assigned for this event." };

    const { data: usernameConflict, error: usernameError } = await supabase
      .from("sellers")
      .select("id")
      .ilike("username", username)
      .limit(1);
    if (usernameError) return { ok: false, message: usernameError.message };
    if (usernameConflict?.length) return { ok: false, message: "That seller username is already in use." };

    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .insert({
        organization_id: defaultOrganizationId,
        company_name: sellerName,
        contact_name: sellerName,
        username,
        email,
        phone: String(formData.get("phone") || "").trim(),
        shop_code: shopCode || null,
        shop_link: shopLink || null,
        open_plan_commission: Number.isFinite(openPlanCommission) ? openPlanCommission : 0,
        tap_commission: Number.isFinite(tapCommission) ? tapCommission : 0,
        logo_url: logoUrl,
        status: "active"
      })
      .select(sellerSelect)
      .single();
    if (sellerError) return { ok: false, message: sellerError.message };

    const { error: eventSellerError } = await supabase.from("event_sellers").insert({
      event_id: eventId,
      seller_id: seller.id,
      booth_name: boothName,
      booth_number: boothNumber,
      status: "active"
    });
    if (eventSellerError) return { ok: false, message: eventSellerError.message };

    const { data: dbBrands, error: brandError } = await supabase
      .from("brands")
      .insert(
        brandNames.map((brandName) => ({
          seller_id: seller.id,
          brand_name: brandName,
          logo_url: logoUrl,
          description: "",
          status: "active"
        }))
      )
      .select("id,seller_id,brand_name,logo_url,description,status");
    if (brandError) return { ok: false, message: brandError.message };

    const brandByName = new Map((dbBrands || []).map((brand) => [String(brand.brand_name).toLowerCase(), brand]));
    const defaultBrand = dbBrands?.[0];
    for (let index = 0; index < productNames.length; index += 1) {
      const productName = productNames[index];
      const brandName = productBrands[index];
      const brand = brandName ? brandByName.get(brandName.toLowerCase()) || defaultBrand : defaultBrand;
      const quantity = productQuantities[index];
      if (!productName || !brand) continue;

      const sampleInventory = Number.isFinite(quantity) && quantity > 0 ? quantity : 50;
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          brand_id: brand.id,
          product_name: productName,
          sku: "",
          pid: productPids[index] || null,
          product_link: productLinks[index] || null,
          description: "",
          sample_inventory: sampleInventory,
          max_claims_per_creator: 1,
          status: "active"
        })
        .select("id")
        .single();
      if (productError) return { ok: false, message: productError.message };

      const { error: eventProductError } = await supabase.from("event_products").insert({
        event_id: eventId,
        product_id: product.id,
        available_quantity: sampleInventory,
        max_claims_per_creator: 1,
        status: "active"
      });
      if (eventProductError) return { ok: false, message: eventProductError.message };
    }

    const invite: SellerInvite = {
      id: crypto.randomUUID(),
      seller_id: seller.id,
      username,
      email,
      login_url: appUrl("/seller"),
      temporary_password: password,
      created_at: new Date().toISOString(),
      status: "queued"
    };
    await supabase.from("seller_invites").insert(invite);

    return { ok: true, message: "Seller added and login details created.", seller: sellerFromRow(seller), invite };
  }

  const s = state();
  if (!s.events.some((event) => event.id === eventId)) {
    return { ok: false, message: "Event not found." };
  }
  if (s.eventSellers.some((eventSeller) => eventSeller.event_id === eventId && eventSeller.booth_number.toLowerCase() === boothNumber.toLowerCase())) {
    return { ok: false, message: "That booth number is already assigned for this event." };
  }
  if (s.sellers.some((seller) => seller.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, message: "That seller username is already in use." };
  }

  const seller: Seller = {
    id: uid("sel"),
    company_name: sellerName,
    contact_name: sellerName,
    username,
    email,
    phone: String(formData.get("phone") || "").trim(),
    shop_code: shopCode || undefined,
    shop_link: shopLink || undefined,
    open_plan_commission: Number.isFinite(openPlanCommission) ? openPlanCommission : 0,
    tap_commission: Number.isFinite(tapCommission) ? tapCommission : 0,
    logo_url: logoUrl,
    status: "active"
  };
  s.sellers.unshift(seller);

  const eventSeller: EventSeller = {
    id: uid("evs"),
    event_id: eventId,
    seller_id: seller.id,
    booth_name: boothName,
    booth_number: boothNumber,
    status: "active"
  };
  s.eventSellers.unshift(eventSeller);

  const brandByName = new Map<string, Brand>();
  for (const brandName of brandNames) {
    const brand: Brand = {
      id: uid("bra"),
      seller_id: seller.id,
      brand_name: brandName,
      logo_url: logoUrl,
      description: "",
      status: "active"
    };
    s.brands.unshift(brand);
    brandByName.set(brandName.toLowerCase(), brand);
  }

  const defaultBrand = Array.from(brandByName.values())[0];
  for (let index = 0; index < productNames.length; index += 1) {
    const productName = productNames[index];
    const brandName = productBrands[index];
    const brand = brandName ? brandByName.get(brandName.toLowerCase()) || defaultBrand : defaultBrand;
    const quantity = productQuantities[index];

    if (!productName || !brand) continue;

    const product: Product = {
      id: uid("prd"),
      brand_id: brand.id,
      product_name: productName,
      sku: "",
      pid: productPids[index] || undefined,
      product_link: productLinks[index] || undefined,
      image_url: undefined,
      description: "",
      sample_inventory: Number.isFinite(quantity) && quantity > 0 ? quantity : 50,
      max_claims_per_creator: 1,
      status: "active"
    };
    s.products.unshift(product);
    s.eventProducts.unshift({
      id: uid("evp"),
      event_id: eventId,
      product_id: product.id,
      available_quantity: product.sample_inventory,
      max_claims_per_creator: product.max_claims_per_creator,
      status: "active"
    });
  }

  const invite: SellerInvite = {
    id: uid("inv"),
    seller_id: seller.id,
    username,
    email,
    login_url: appUrl("/seller"),
    temporary_password: password,
    created_at: new Date().toISOString(),
    status: "queued"
  };
  s.sellerInvites.unshift(invite);
  return { ok: true, message: "Seller added and login details created.", seller, invite };
}

export async function addBrand(formData: FormData) {
  const brandName = String(formData.get("brand_name") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!brandName) return { ok: false, message: "Brand name is required." };

  const supabase = createServiceClient();
  if (supabase) {
    const { data: seller } = await supabase.from("sellers").select("id").order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (!seller) return { ok: false, message: "Seller not found." };

    const { data: brand, error } = await supabase
      .from("brands")
      .insert({
        seller_id: seller.id,
        brand_name: brandName,
        description,
        logo_url: String(formData.get("logo_url") || "").trim() || null,
        status: "active"
      })
      .select("id,seller_id,brand_name,logo_url,description,status")
      .single();
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Brand added.", brand: brandFromRow(brand) };
  }

  const s = state();
  const brand: Brand = {
    id: uid("bra"),
    seller_id: demoSeller.id,
    brand_name: brandName,
    description,
    logo_url: String(formData.get("logo_url") || "").trim() || undefined,
    status: "active"
  };

  s.brands.unshift(brand);
  return { ok: true, message: "Brand added.", brand };
}

export async function addProduct(formData: FormData) {
  const brandId = String(formData.get("brand_id") || "");
  const productName = String(formData.get("product_name") || "").trim();
  const pid = String(formData.get("pid") || "").trim();
  const productLink = String(formData.get("product_link") || "").trim();
  const inventory = Number(formData.get("sample_inventory") || 0);
  const maxClaims = Number(formData.get("max_claims_per_creator") || 1);

  if (!brandId || !productName) return { ok: false, message: "Brand and product name are required." };

  const supabase = createServiceClient();
  if (supabase) {
    const { data: brand, error: brandError } = await supabase.from("brands").select("id").eq("id", brandId).maybeSingle();
    if (brandError) return { ok: false, message: brandError.message };
    if (!brand) return { ok: false, message: "Brand not found." };

    const sampleInventory = Number.isFinite(inventory) && inventory >= 0 ? inventory : 0;
    const maxClaims = Number(formData.get("max_claims_per_creator") || 1);
    const maxClaimsPerCreator = Number.isFinite(maxClaims) && maxClaims > 0 ? maxClaims : 1;
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        brand_id: brand.id,
        product_name: productName,
        sku: String(formData.get("sku") || "").trim(),
        pid: pid || null,
        product_link: productLink || null,
        image_url: String(formData.get("image_url") || "").trim() || null,
        description: String(formData.get("description") || "").trim(),
        sample_inventory: sampleInventory,
        max_claims_per_creator: maxClaimsPerCreator,
        status: "active"
      })
      .select(productSelect)
      .single();
    if (productError) return { ok: false, message: productError.message };

    const { data: events, error: eventsError } = await supabase.from("events").select("id");
    if (eventsError) return { ok: false, message: eventsError.message };
    if (events?.length) {
      const { error: eventProductsError } = await supabase.from("event_products").insert(
        events.map((event) => ({
          event_id: event.id,
          product_id: product.id,
          available_quantity: sampleInventory,
          max_claims_per_creator: maxClaimsPerCreator,
          status: "active"
        }))
      );
      if (eventProductsError) return { ok: false, message: eventProductsError.message };
    }

    return { ok: true, message: "Product added.", product: productFromRow(product) };
  }

  const s = state();
  const brand = s.brands.find((item) => item.id === brandId);
  if (!brand) return { ok: false, message: "Brand not found." };

  const product: Product = {
    id: uid("prd"),
    brand_id: brand.id,
    product_name: productName,
    sku: String(formData.get("sku") || "").trim(),
    pid: pid || undefined,
    product_link: productLink || undefined,
    image_url: String(formData.get("image_url") || "").trim() || undefined,
    description: String(formData.get("description") || "").trim(),
    sample_inventory: Number.isFinite(inventory) && inventory >= 0 ? inventory : 0,
    max_claims_per_creator: Number.isFinite(maxClaims) && maxClaims > 0 ? maxClaims : 1,
    status: "active"
  };

  s.products.unshift(product);
  for (const event of s.events) {
    s.eventProducts.unshift({
      id: uid("evp"),
      event_id: event.id,
      product_id: product.id,
      available_quantity: product.sample_inventory,
      max_claims_per_creator: product.max_claims_per_creator,
      status: "active"
    });
  }

  return { ok: true, message: "Product added.", product };
}

export async function updateProduct(formData: FormData) {
  const productId = String(formData.get("product_id") || "");
  const productName = String(formData.get("product_name") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const pid = String(formData.get("pid") || "").trim();
  const productLink = String(formData.get("product_link") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const sampleInventory = Number(formData.get("sample_inventory") || 0);
  const addRemainingQuantity = Number(formData.get("add_remaining_quantity") || 0);
  const maxClaims = Number(formData.get("max_claims_per_creator") || 1);

  if (!productId || !productName) return { ok: false, message: "Product name is required." };

  const inventory = Number.isFinite(sampleInventory) && sampleInventory >= 0 ? sampleInventory : 0;
  const addRemaining = Number.isFinite(addRemainingQuantity) && addRemainingQuantity > 0 ? addRemainingQuantity : 0;
  const adjustedInventory = inventory + addRemaining;
  const maxClaimsPerCreator = Number.isFinite(maxClaims) && maxClaims > 0 ? maxClaims : 1;
  const supabase = createServiceClient();

  if (supabase) {
    const { data: product, error } = await supabase
      .from("products")
      .update({
        product_name: productName,
        sku,
        pid: pid || null,
        product_link: productLink || null,
        description,
        sample_inventory: adjustedInventory,
        max_claims_per_creator: maxClaimsPerCreator
      })
      .eq("id", productId)
      .select(productSelect)
      .maybeSingle();
    if (error) return { ok: false, message: error.message };
    if (!product) return { ok: false, message: "Product not found." };

    const updatedProduct = productFromRow(product);
    const { data: brand, error: brandError } = await supabase.from("brands").select("seller_id").eq("id", updatedProduct.brand_id).maybeSingle();
    if (brandError) return { ok: false, message: brandError.message };

    const { data: assignedEvents, error: assignedEventsError } = brand
      ? await supabase.from("event_sellers").select("event_id").eq("seller_id", brand.seller_id)
      : { data: [], error: null };
    if (assignedEventsError) return { ok: false, message: assignedEventsError.message };
    let assignedEventIds = (assignedEvents || []).map((item) => String(item.event_id));
    if (!assignedEventIds.length) {
      const { data: allEvents, error: allEventsError } = await supabase.from("events").select("id");
      if (allEventsError) return { ok: false, message: allEventsError.message };
      assignedEventIds = (allEvents || []).map((item) => String(item.id));
    }

    const { data: eventProducts, error: eventProductsLoadError } = await supabase
      .from("event_products")
      .select("id,event_id,available_quantity")
      .eq("product_id", productId);
    if (eventProductsLoadError) return { ok: false, message: eventProductsLoadError.message };

    for (const eventProduct of eventProducts || []) {
      if (assignedEventIds.length && !assignedEventIds.includes(String(eventProduct.event_id))) continue;
      const { error: eventProductError } = await supabase
        .from("event_products")
        .update({
          available_quantity: Number(eventProduct.available_quantity || 0) + addRemaining,
          max_claims_per_creator: maxClaimsPerCreator
        })
        .eq("id", eventProduct.id);
      if (eventProductError) return { ok: false, message: eventProductError.message };
    }

    const existingEventIds = new Set((eventProducts || []).map((eventProduct) => String(eventProduct.event_id)));
    const missingEventProducts = assignedEventIds
      .filter((eventId) => !existingEventIds.has(eventId))
      .map((eventId) => ({
        event_id: eventId,
        product_id: productId,
        available_quantity: addRemaining || adjustedInventory,
        max_claims_per_creator: maxClaimsPerCreator,
        status: "active"
      }));
    if (missingEventProducts.length) {
      const { error: insertEventProductsError } = await supabase.from("event_products").insert(missingEventProducts);
      if (insertEventProductsError) return { ok: false, message: insertEventProductsError.message };
    }

    return { ok: true, message: "Product updated.", product: updatedProduct };
  }

  const s = state();
  const product = s.products.find((item) => item.id === productId);
  if (!product) return { ok: false, message: "Product not found." };

  product.product_name = productName;
  product.sku = sku;
  product.pid = pid || undefined;
  product.product_link = productLink || undefined;
  product.description = description;
  product.sample_inventory = adjustedInventory;
  product.max_claims_per_creator = maxClaimsPerCreator;
  const brand = s.brands.find((item) => item.id === product.brand_id);
  let assignedEventIds = brand ? s.eventSellers.filter((item) => item.seller_id === brand.seller_id).map((item) => item.event_id) : [];
  if (!assignedEventIds.length) assignedEventIds = s.events.map((event) => event.id);
  s.eventProducts
    .filter((item) => item.product_id === productId && (!assignedEventIds.length || assignedEventIds.includes(item.event_id)))
    .forEach((item) => {
      item.available_quantity += addRemaining;
      item.max_claims_per_creator = maxClaimsPerCreator;
    });
  const existingEventIds = new Set(s.eventProducts.filter((item) => item.product_id === productId).map((item) => item.event_id));
  for (const eventId of assignedEventIds) {
    if (existingEventIds.has(eventId)) continue;
    s.eventProducts.unshift({
      id: uid("evp"),
      event_id: eventId,
      product_id: product.id,
      available_quantity: addRemaining || adjustedInventory,
      max_claims_per_creator: maxClaimsPerCreator,
      status: "active"
    });
  }

  return { ok: true, message: "Product updated.", product };
}

export async function updateEventProductInventory(formData: FormData) {
  const eventId = String(formData.get("event_id") || "");
  const productId = String(formData.get("product_id") || "");
  const eventProductId = String(formData.get("event_product_id") || "");
  const availableValue = Number(formData.get("available_quantity") || 0);
  const maxClaimsValue = Number(formData.get("max_claims_per_creator") || 1);
  const availableQuantity = Number.isFinite(availableValue) && availableValue >= 0 ? availableValue : 0;
  const maxClaimsPerCreator = Number.isFinite(maxClaimsValue) && maxClaimsValue > 0 ? maxClaimsValue : 1;

  if (!eventId || !productId) return { ok: false, message: "Event and product are required." };

  const supabase = createServiceClient();
  if (supabase) {
    const payload = {
      event_id: eventId,
      product_id: productId,
      available_quantity: availableQuantity,
      max_claims_per_creator: maxClaimsPerCreator,
      status: "active"
    };

    const result = eventProductId
      ? await supabase.from("event_products").update(payload).eq("id", eventProductId).select("id").maybeSingle()
      : await supabase.from("event_products").upsert(payload, { onConflict: "event_id,product_id" }).select("id").maybeSingle();
    if (result.error) return { ok: false, message: result.error.message };

    await supabase.from("products").update({ max_claims_per_creator: maxClaimsPerCreator }).eq("id", productId);
    return { ok: true, message: "Event product inventory updated." };
  }

  const s = state();
  let eventProduct = s.eventProducts.find((item) => item.id === eventProductId) || s.eventProducts.find((item) => item.event_id === eventId && item.product_id === productId);
  if (!eventProduct) {
    eventProduct = {
      id: uid("evp"),
      event_id: eventId,
      product_id: productId,
      available_quantity: availableQuantity,
      max_claims_per_creator: maxClaimsPerCreator,
      status: "active"
    };
    s.eventProducts.unshift(eventProduct);
  } else {
    eventProduct.available_quantity = availableQuantity;
    eventProduct.max_claims_per_creator = maxClaimsPerCreator;
    eventProduct.status = "active";
  }

  const product = s.products.find((item) => item.id === productId);
  if (product) product.max_claims_per_creator = maxClaimsPerCreator;
  return { ok: true, message: "Event product inventory updated." };
}

export async function getAdminOverview() {
  const s = (await loadDbState()) || state();
  const approved = s.registrations.filter((registration) => registration.registration_status === "approved").length;
  const checkedIn = s.attendance.filter((attendance) => attendance.status === "checked_in").length;
  const samplesIssued = s.claims
    .filter((claim) => claim.status === "claimed")
    .reduce((total, claim) => total + claim.quantity, 0);

  return {
    event: demoEvent,
    registered: s.registrations.length,
    approved,
    checkedIn,
    attendanceRate: approved ? Math.round((checkedIn / approved) * 100) : 0,
    sellers: s.sellers.length,
    brands: s.brands.length,
    products: s.products.length,
    samplesIssued,
    remainingSamples: s.eventProducts.reduce((total, product) => total + product.available_quantity, 0)
  };
}

export async function listRegistrations(eventId?: string, query = ""): Promise<RegistrationRow[]> {
  const needle = query.trim().toLowerCase();
  const supabase = createServiceClient();
  if (supabase) {
    let registrationQuery = supabase
      .from("event_registrations")
      .select("id,event_id,creator_id,form_response_id,registration_status,registered_at,approved_at,notes")
      .order("registered_at", { ascending: false });

    if (eventId) {
      registrationQuery = registrationQuery.eq("event_id", eventId);
    }

    const { data: registrationRows, error: registrationError } = await registrationQuery;
    if (registrationError) {
      console.error("Failed to load registrations", registrationError);
      return [];
    }
    if (!registrationRows?.length) return [];

    const registrations = registrationRows.map(registrationFromRow);
    const creatorIds = unique(registrations.map((registration) => registration.creator_id));
    const responseIds = unique(registrations.map((registration) => registration.form_response_id));
    const registrationIds = unique(registrations.map((registration) => registration.id));

    const [creatorsResult, responsesResult, attendanceResult, qrsResult] = await Promise.all([
      supabase
        .from("creators")
        .select("id,full_name,tiktok_username,tiktok_profile_url,email,mobile,location,follower_count,gmv_max_total,creator_category,content_categories,affiliate_experience,profile_image,notes")
        .in("id", creatorIds),
      supabase
        .from("event_form_responses")
        .select("id,event_id,creator_id,form_version_id,field_snapshot,answers,submitted_at")
        .in("id", responseIds),
      supabase
        .from("event_attendance")
        .select("id,event_id,creator_id,registration_id,status,checked_in_at,checked_in_by")
        .in("registration_id", registrationIds),
      supabase
        .from("creator_event_qr")
        .select("id,event_id,creator_id,registration_id,attendance_id,qr_token,qr_url,status,generated_at,last_scanned_at")
        .in("registration_id", registrationIds)
    ]);

    const error = [creatorsResult.error, responsesResult.error, attendanceResult.error, qrsResult.error].find(Boolean);
    if (error) {
      console.error("Failed to load registration relations", error);
      return [];
    }

    const creators = mapById((creatorsResult.data || []).map(creatorFromRow));
    const responses = mapById((responsesResult.data || []).map(formResponseFromRow));
    const attendance = mapBy((attendanceResult.data || []).map(attendanceFromRow), (row) => row.registration_id);
    const qrs = mapBy((qrsResult.data || []).map(qrFromRow), (row) => row.registration_id);

    return registrations
      .map((registration) => ({
        registration,
        creator: creators.get(registration.creator_id)!,
        attendance: attendance.get(registration.id),
        response: responses.get(registration.form_response_id),
        qr: qrs.get(registration.id)
      }))
      .filter((row) => row.creator)
      .filter((row) => {
        if (!needle) return true;
        return [row.creator.full_name, row.creator.tiktok_username, row.creator.mobile, row.creator.email].some((value) =>
          value.toLowerCase().includes(needle)
        );
      });
  }

  const s = (await loadDbState()) || state();

  return s.registrations
    .filter((registration) => !eventId || registration.event_id === eventId)
    .map((registration) => {
      const creator = s.creators.find((item) => item.id === registration.creator_id)!;
      return {
        registration,
        creator,
        attendance: s.attendance.find((item) => item.registration_id === registration.id),
        response: s.responses.find((item) => item.id === registration.form_response_id),
        qr: s.qrs.find((item) => item.registration_id === registration.id)
      };
    })
    .filter((row) => {
      if (!needle) return true;
      return [row.creator.full_name, row.creator.tiktok_username, row.creator.mobile, row.creator.email].some((value) =>
        value.toLowerCase().includes(needle)
      );
    });
}

export async function getRegistrationDetail(registrationId: string) {
  const row = (await listRegistrations()).find((item) => item.registration.id === registrationId);
  if (!row) return null;
  const event = await getEventById(row.registration.event_id);
  return { ...row, event };
}

export async function listAttendedCreators(query = "") {
  const needle = query.trim().toLowerCase();
  const supabase = createServiceClient();
  if (supabase) {
    const { data: attendanceRows, error } = await supabase
      .from("event_attendance")
      .select("id,event_id,creator_id,registration_id,status,checked_in_at,checked_in_by")
      .eq("status", "checked_in")
      .order("checked_in_at", { ascending: false });
    if (error) {
      console.error("Failed to load attended creators", error);
      return [];
    }
    const attendanceRowsMapped = (attendanceRows || []).map(attendanceFromRow);
    if (!attendanceRowsMapped.length) return [];

    const [creatorsResult, registrationsResult, eventsResult, claimsResult] = await Promise.all([
      supabase
        .from("creators")
        .select("id,full_name,tiktok_username,tiktok_profile_url,email,mobile,location,follower_count,gmv_max_total,creator_category,content_categories,affiliate_experience,profile_image,notes")
        .in("id", unique(attendanceRowsMapped.map((attendance) => attendance.creator_id))),
      supabase
        .from("event_registrations")
        .select("id,event_id,creator_id,form_response_id,registration_status,registered_at,approved_at,notes")
        .in("id", unique(attendanceRowsMapped.map((attendance) => attendance.registration_id))),
      supabase.from("events").select(eventSelect).in("id", unique(attendanceRowsMapped.map((attendance) => attendance.event_id))),
      supabase
        .from("sample_claims")
        .select("id,event_id,creator_id,seller_id,brand_id,product_id,quantity,claimed_at,claimed_by,booth_id,qr_scan_id,status")
        .in("creator_id", unique(attendanceRowsMapped.map((attendance) => attendance.creator_id)))
        .eq("status", "claimed")
    ]);

    const creators = mapById((creatorsResult.data || []).map(creatorFromRow));
    const registrationsRaw = (registrationsResult.data || []).map(registrationFromRow);
    const registrations = mapById(registrationsRaw);
    const events = mapById((eventsResult.data || []).map(eventFromRow));
    const claims = (claimsResult.data || []).map(claimFromRow);
    const responseIds = unique(registrationsRaw.map((registration) => registration.form_response_id));
    const { data: responseRows } = responseIds.length
      ? await supabase
        .from("event_form_responses")
        .select("id,event_id,creator_id,form_version_id,field_snapshot,answers,submitted_at")
        .in("id", responseIds)
      : { data: [] };
    const responses = mapById((responseRows || []).map(formResponseFromRow));

    return attendanceRowsMapped
      .map((attendance) => {
        const creator = creators.get(attendance.creator_id)!;
        const registration = registrations.get(attendance.registration_id)!;
        return {
          creator,
          attendance,
          registration,
          response: registration ? responses.get(registration.form_response_id) : undefined,
          event: events.get(attendance.event_id) || demoEvent,
          claims: claims.filter((claim) => claim.creator_id === attendance.creator_id)
        };
      })
      .filter((row) => row.creator && row.registration)
      .filter(({ creator, response }) => {
        if (!needle) return true;
        return [creator.full_name, creator.tiktok_username, creator.email, creator.mobile, ...Object.values(response?.answers || {}).map(String)].some((value) =>
          value.toLowerCase().includes(needle)
        );
      });
  }

  const s = (await loadDbState()) || state();

  return s.attendance
    .filter((attendance) => attendance.status === "checked_in")
    .map((attendance) => {
      const creator = s.creators.find((item) => item.id === attendance.creator_id)!;
      const registration = s.registrations.find((item) => item.id === attendance.registration_id)!;
      const response = s.responses.find((item) => item.id === registration.form_response_id);
      const event = s.events.find((item) => item.id === attendance.event_id) || demoEvent;
      const claims = s.claims.filter((claim) => claim.creator_id === creator.id && claim.status === "claimed");
      return { creator, attendance, registration, response, event, claims };
    })
    .filter(({ creator, response }) => {
      if (!needle) return true;
      return [creator.full_name, creator.tiktok_username, creator.email, creator.mobile, ...Object.values(response?.answers || {}).map(String)].some((value) =>
        value.toLowerCase().includes(needle)
      );
    });
}

export async function getCreatorDetail(creatorId: string) {
  const supabase = createServiceClient();
  if (supabase) {
    const { data: creatorRow, error } = await supabase
      .from("creators")
      .select("id,full_name,tiktok_username,tiktok_profile_url,email,mobile,location,follower_count,gmv_max_total,creator_category,content_categories,affiliate_experience,profile_image,notes")
      .eq("id", creatorId)
      .maybeSingle();
    if (error) console.error("Failed to load creator detail", error);
    if (!creatorRow) return null;

    const creator = creatorFromRow(creatorRow);
    const { data: registrationRows } = await supabase
      .from("event_registrations")
      .select("id,event_id,creator_id,form_response_id,registration_status,registered_at,approved_at,notes")
      .eq("creator_id", creator.id)
      .order("registered_at", { ascending: false });
    const registrationsRaw = (registrationRows || []).map(registrationFromRow);

    const [eventsResult, attendanceResult, responsesResult, qrsResult, claimsResult, accountResult] = await Promise.all([
      registrationsRaw.length
        ? supabase.from("events").select(eventSelect).in("id", unique(registrationsRaw.map((registration) => registration.event_id)))
        : Promise.resolve({ data: [], error: null }),
      registrationsRaw.length
        ? supabase
          .from("event_attendance")
          .select("id,event_id,creator_id,registration_id,status,checked_in_at,checked_in_by")
          .in("registration_id", unique(registrationsRaw.map((registration) => registration.id)))
        : Promise.resolve({ data: [], error: null }),
      registrationsRaw.length
        ? supabase
          .from("event_form_responses")
          .select("id,event_id,creator_id,form_version_id,field_snapshot,answers,submitted_at")
          .in("id", unique(registrationsRaw.map((registration) => registration.form_response_id)))
        : Promise.resolve({ data: [], error: null }),
      registrationsRaw.length
        ? supabase
          .from("creator_event_qr")
          .select("id,event_id,creator_id,registration_id,attendance_id,qr_token,qr_url,status,generated_at,last_scanned_at")
          .in("registration_id", unique(registrationsRaw.map((registration) => registration.id)))
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("sample_claims")
        .select("id,event_id,creator_id,seller_id,brand_id,product_id,quantity,claimed_at,claimed_by,booth_id,qr_scan_id,status")
        .eq("creator_id", creator.id),
      supabase
        .from("creator_accounts")
        .select("id,creator_id,user_id,email,status,invited_by,invited_at,activated_at,created_at,updated_at")
        .eq("creator_id", creator.id)
        .maybeSingle()
    ]);

    const events = mapById((eventsResult.data || []).map(eventFromRow));
    const attendance = mapBy((attendanceResult.data || []).map(attendanceFromRow), (row) => row.registration_id);
    const responses = mapById((responsesResult.data || []).map(formResponseFromRow));
    const qrs = mapBy((qrsResult.data || []).map(qrFromRow), (row) => row.registration_id);
    const claims = (claimsResult.data || []).map(claimFromRow);

    const [claimEventsResult, claimBrandsResult, claimProductsResult, claimSellersResult] = await Promise.all([
      claims.length ? supabase.from("events").select(eventSelect).in("id", unique(claims.map((claim) => claim.event_id))) : Promise.resolve({ data: [], error: null }),
      claims.length ? supabase.from("brands").select("id,seller_id,brand_name,logo_url,description,status").in("id", unique(claims.map((claim) => claim.brand_id))) : Promise.resolve({ data: [], error: null }),
      claims.length
        ? supabase
          .from("products")
          .select(productSelect)
          .in("id", unique(claims.map((claim) => claim.product_id)))
        : Promise.resolve({ data: [], error: null }),
      claims.length ? supabase.from("sellers").select(sellerSelect).in("id", unique(claims.map((claim) => claim.seller_id))) : Promise.resolve({ data: [], error: null })
    ]);

    const claimEvents = mapById((claimEventsResult.data || []).map(eventFromRow));
    const claimBrands = mapById((claimBrandsResult.data || []).map(brandFromRow));
    const claimProducts = mapById((claimProductsResult.data || []).map(productFromRow));
    const claimSellers = mapById((claimSellersResult.data || []).map(sellerFromRow));

    return {
      creator,
      portalAccount: accountResult.data ? creatorAccountFromRow(accountResult.data) : undefined,
      registrations: registrationsRaw.map((registration) => ({
        registration,
        event: events.get(registration.event_id) || demoEvent,
        attendance: attendance.get(registration.id),
        response: responses.get(registration.form_response_id),
        qr: qrs.get(registration.id)
      })),
      sampleClaims: claims
        .map((claim) => ({
          claim,
          event: claimEvents.get(claim.event_id) || demoEvent,
          brand: claimBrands.get(claim.brand_id)!,
          product: claimProducts.get(claim.product_id)!,
          seller: claimSellers.get(claim.seller_id) || demoSeller
        }))
        .filter((row) => row.brand && row.product)
    };
  }

  const s = (await loadDbState()) || state();
  const creator = s.creators.find((item) => item.id === creatorId);
  if (!creator) return null;

  const registrations = s.registrations
    .filter((registration) => registration.creator_id === creator.id)
    .map((registration) => ({
      registration,
      event: s.events.find((event) => event.id === registration.event_id) || demoEvent,
      attendance: s.attendance.find((attendance) => attendance.registration_id === registration.id),
      response: s.responses.find((response) => response.id === registration.form_response_id),
      qr: s.qrs.find((qr) => qr.registration_id === registration.id)
    }));

  const sampleClaims = s.claims
    .filter((claim) => claim.creator_id === creator.id)
    .map((claim) => ({
      claim,
      event: s.events.find((event) => event.id === claim.event_id) || demoEvent,
      brand: s.brands.find((brand) => brand.id === claim.brand_id)!,
      product: s.products.find((product) => product.id === claim.product_id)!,
      seller: demoSeller
    }));

  const portalAccount = s.creatorAccounts?.find((account) => account.creator_id === creator.id);

  return { creator, portalAccount, registrations, sampleClaims };
}

export async function getCreatorPortalOverview(userId: string) {
  const supabase = createServiceClient();
  if (supabase) {
    const { data: accountRow, error } = await supabase
      .from("creator_accounts")
      .select("id,creator_id,user_id,email,status,invited_by,invited_at,activated_at,created_at,updated_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    if (error) {
      console.error("Failed to load creator portal account", error);
      return null;
    }
    if (!accountRow) return null;

    const account = creatorAccountFromRow(accountRow);
    const detail = await getCreatorDetail(account.creator_id);
    if (!detail) return null;
    const events = await listEvents();
    const upcomingEvents = events
      .filter((event) => event.event_date >= new Date().toISOString().slice(0, 10))
      .slice(0, 3);

    return {
      account,
      creator: detail.creator,
      registrations: detail.registrations,
      sampleClaims: detail.sampleClaims,
      upcomingEvents
    };
  }

  return null;
}

export async function getCreatorAccountForUser(userId: string) {
  const supabase = createServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("creator_accounts")
      .select("id,creator_id,user_id,email,status,invited_by,invited_at,activated_at,created_at,updated_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    if (error) {
      console.error("Failed to load creator account", error);
      return null;
    }
    return data ? creatorAccountFromRow(data) : null;
  }
  return null;
}

export async function listCreatorCampaigns(userId: string) {
  const account = await getCreatorAccountForUser(userId);
  if (!account) return [];

  const supabase = createServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("affiliate_campaigns")
      .select(campaignSelect)
      .in("status", ["recruiting", "active"])
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load creator campaigns", error);
      return [];
    }

    const campaigns = (data || []).map(campaignFromRow);
    if (!campaigns.length) return [];
    const brandIds = unique(campaigns.map((campaign) => campaign.brand_id));
    const campaignIds = unique(campaigns.map((campaign) => campaign.id));
    const [brandsResult, applicationsResult] = await Promise.all([
      supabase.from("brands").select("id,seller_id,brand_name,logo_url,description,status").in("id", brandIds),
      supabase
        .from("campaign_applications")
        .select("id,campaign_id,creator_id,status,application_message,applied_at,reviewed_at,reviewed_by,rejection_reason,created_at,updated_at")
        .in("campaign_id", campaignIds)
        .eq("creator_id", account.creator_id)
    ]);
    const brands = (brandsResult.data || []).map(brandFromRow);
    const sellerIds = unique(brands.map((brand) => brand.seller_id));
    const { data: sellerRows } = sellerIds.length ? await supabase.from("sellers").select(sellerSelect).in("id", sellerIds) : { data: [] };
    const sellers = mapById((sellerRows || []).map(sellerFromRow));
    const brandMap = mapById(brands);
    const applications = (applicationsResult.data || []).map(campaignApplicationFromRow);

    return campaigns.map((campaign) => {
      const brand = brandMap.get(campaign.brand_id);
      return {
        campaign,
        brand,
        seller: brand ? sellers.get(brand.seller_id) : undefined,
        application: applications.find((application) => application.campaign_id === campaign.id)
      };
    });
  }

  return [];
}

export async function getCreatorCampaignDetail(userId: string, campaignId: string) {
  const rows = await listCreatorCampaigns(userId);
  return rows.find((row) => row.campaign.id === campaignId) || null;
}

export async function applyToCampaign(userId: string, campaignId: string, message: string) {
  const account = await getCreatorAccountForUser(userId);
  if (!account) return { ok: false, message: "Creator account not found." };

  const supabase = createServiceClient();
  if (supabase) {
    const { data: campaignRow, error: campaignError } = await supabase
      .from("affiliate_campaigns")
      .select(campaignSelect)
      .eq("id", campaignId)
      .in("status", ["recruiting", "active"])
      .maybeSingle();
    if (campaignError) return { ok: false, message: campaignError.message };
    if (!campaignRow) return { ok: false, message: "Campaign is not accepting applications." };

    const { data: existing, error: existingError } = await supabase
      .from("campaign_applications")
      .select("id,status")
      .eq("campaign_id", campaignId)
      .eq("creator_id", account.creator_id)
      .maybeSingle();
    if (existingError) return { ok: false, message: existingError.message };
    if (existing && String(existing.status) !== "withdrawn") return { ok: false, message: "You already applied for this campaign." };

    const { error } = await supabase.from("campaign_applications").upsert(
      {
        campaign_id: campaignId,
        creator_id: account.creator_id,
        status: "applied",
        application_message: message,
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: "campaign_id,creator_id" }
    );
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Campaign application submitted." };
  }

  return { ok: false, message: "Campaign applications require Supabase." };
}

export async function updateCampaignApplicationStatus(applicationId: string, status: CampaignApplication["status"], reviewerId?: string) {
  const allowed: CampaignApplication["status"][] = ["applied", "under_review", "approved", "rejected", "waitlisted", "withdrawn"];
  if (!allowed.includes(status)) return { ok: false, message: "Invalid campaign application status." };

  const supabase = createServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("campaign_applications")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", applicationId)
      .select("id,campaign_id")
      .maybeSingle();
    if (error) return { ok: false, message: error.message };
    if (!data) return { ok: false, message: "Campaign application not found." };
    return { ok: true, message: `Application marked ${status.replaceAll("_", " ")}.`, campaignId: String(data.campaign_id) };
  }

  const s = state();
  const application = s.campaignApplications?.find((item) => item.id === applicationId);
  if (!application) return { ok: false, message: "Campaign application not found." };
  application.status = status;
  application.reviewed_at = new Date().toISOString();
  application.reviewed_by = reviewerId;
  application.updated_at = new Date().toISOString();
  return { ok: true, message: `Application marked ${status.replaceAll("_", " ")}.`, campaignId: application.campaign_id };
}

export async function submitRegistration(slug: string, formData: FormData) {
  const event = await getEventBySlug(slug);
  if (!event) return { ok: false, message: "Event not found." };

  const form = await getPublishedForm(event.id);
  if (!form) return { ok: false, message: "Registration is not open." };

  const answers = Object.fromEntries(formData.entries());
  for (const field of form.fields) {
    if (field.required && !String(answers[field.id] || "").trim()) {
      return { ok: false, message: `${field.label} is required.` };
    }
  }

  const mobile = String(answers.mobile || "");
  const email = String(answers.email || "");

  const supabase = await ensureOrganization();
  if (supabase) {
    let creator = null as { id: string } | null;
    if (email) {
      const { data, error } = await supabase
        .from("creators")
        .select("id")
        .eq("organization_id", defaultOrganizationId)
        .ilike("email", email)
        .maybeSingle();
      if (error) return { ok: false, message: error.message };
      creator = data;
    }
    if (!creator && mobile) {
      const { data, error } = await supabase
        .from("creators")
        .select("id")
        .eq("organization_id", defaultOrganizationId)
        .eq("mobile", mobile)
        .maybeSingle();
      if (error) return { ok: false, message: error.message };
      creator = data;
    }

    if (!creator) {
      const { data, error } = await supabase
        .from("creators")
        .insert({
          organization_id: defaultOrganizationId,
          full_name: String(answers.full_name || ""),
          tiktok_username: String(answers.tiktok_username || "").replace(/^@/, ""),
          tiktok_profile_url: String(answers.tiktok_profile_url || ""),
          email,
          mobile,
          location: String(answers.location || ""),
          follower_count: Number(answers.follower_count || 0),
          gmv_max_total: creatorMaxGmvFromAnswers(answers),
          creator_category: String(answers.creator_category || ""),
          content_categories: String(answers.content_categories || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          affiliate_experience: String(answers.affiliate_experience || "")
        })
        .select("id")
        .single();
      if (error) return { ok: false, message: error.message };
      creator = data;
    }

    const { data: existing } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", event.id)
      .eq("creator_id", creator.id)
      .maybeSingle();
    if (existing) {
      const { data: qr, error: qrError } = await supabase
        .from("creator_event_qr")
        .select("qr_token")
        .eq("registration_id", existing.id)
        .maybeSingle();
      if (qrError) return { ok: false, message: qrError.message };
      return { ok: true, message: "Registration already received.", registrationId: existing.id, qrToken: qr?.qr_token };
    }

    const submittedAt = new Date().toISOString();
    const { data: response, error: responseError } = await supabase
      .from("event_form_responses")
      .insert({
        event_id: event.id,
        creator_id: creator.id,
        form_version_id: form.id,
        field_snapshot: form.fields,
        answers,
        submitted_at: submittedAt
      })
      .select("id")
      .single();
    if (responseError) return { ok: false, message: responseError.message };

    const { data: registration, error: registrationError } = await supabase
      .from("event_registrations")
      .insert({
        event_id: event.id,
        creator_id: creator.id,
        form_response_id: response.id,
        registration_status: "pending",
        registered_at: submittedAt
      })
      .select("id")
      .single();
    if (registrationError) return { ok: false, message: registrationError.message };

    const token = `tap_${crypto.randomUUID().replaceAll("-", "")}`;
    const { data: qr, error: qrError } = await supabase
      .from("creator_event_qr")
      .insert({
        event_id: event.id,
        creator_id: creator.id,
        registration_id: registration.id,
        qr_token: token,
        qr_url: appUrl(`/qr/${token}`),
        status: "pending_approval"
      })
      .select("qr_token")
      .single();
    if (qrError) return { ok: false, message: qrError.message };

    return { ok: true, message: "Registration received.", registrationId: registration.id, qrToken: qr.qr_token };
  }

  const s = state();
  let creator = s.creators.find((item) => item.mobile === mobile || item.email.toLowerCase() === email.toLowerCase());

  if (!creator) {
    creator = {
      id: uid("cre"),
      full_name: String(answers.full_name || ""),
      tiktok_username: String(answers.tiktok_username || "").replace(/^@/, ""),
      tiktok_profile_url: String(answers.tiktok_profile_url || ""),
      email,
      mobile,
      location: String(answers.location || ""),
      follower_count: Number(answers.follower_count || 0),
      gmv_max_total: creatorMaxGmvFromAnswers(answers),
      creator_category: String(answers.creator_category || ""),
      content_categories: String(answers.content_categories || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      affiliate_experience: String(answers.affiliate_experience || "")
    };
    s.creators.unshift(creator);
  }

  const existing = s.registrations.find((registration) => registration.event_id === event.id && registration.creator_id === creator!.id);
  if (existing) {
    const qr = ensureCreatorQr(existing);
    return { ok: true, message: "Registration already received.", registrationId: existing.id, qrToken: qr.qr_token };
  }

  const response: FormResponse = {
    id: uid("resp"),
    event_id: event.id,
    creator_id: creator.id,
    form_version_id: form.id,
    field_snapshot: structuredClone(form.fields),
    answers,
    submitted_at: new Date().toISOString()
  };
  const registration: Registration = {
    id: uid("reg"),
    event_id: event.id,
    creator_id: creator.id,
    form_response_id: response.id,
    registration_status: "pending",
    registered_at: response.submitted_at
  };

  s.responses.unshift(response);
  s.registrations.unshift(registration);
  const qr = ensureCreatorQr(registration, "pending_approval");

  return { ok: true, message: "Registration received.", registrationId: registration.id, qrToken: qr.qr_token };
}

export async function setRegistrationStatus(registrationId: string, status: Registration["registration_status"]) {
  const supabase = createServiceClient();
  if (supabase) {
    const { data: registration, error } = await supabase
      .from("event_registrations")
      .update({
        registration_status: status,
        approved_at: status === "approved" ? new Date().toISOString() : null
      })
      .eq("id", registrationId)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, message: error.message };
    if (!registration) return { ok: false, message: "Registration not found." };

    const qrStatus =
      status === "approved"
        ? "approved_not_checked_in"
        : status === "rejected" || status === "cancelled"
          ? "revoked"
          : "pending_approval";
    const { error: qrError } = await supabase.from("creator_event_qr").update({ status: qrStatus }).eq("registration_id", registrationId);
    if (qrError) return { ok: false, message: qrError.message };
    return { ok: true, message: `Registration ${status}.` };
  }

  const registration = state().registrations.find((item) => item.id === registrationId);
  if (!registration) return { ok: false, message: "Registration not found." };
  registration.registration_status = status;
  if (status === "approved") registration.approved_at = new Date().toISOString();
  const qrStatus =
    status === "approved"
      ? "approved_not_checked_in"
      : status === "rejected" || status === "cancelled"
        ? "revoked"
        : "pending_approval";
  ensureCreatorQr(registration, qrStatus);
  return { ok: true, message: `Registration ${status}.` };
}

export async function checkInCreator(registrationId: string) {
  const supabase = createServiceClient();
  if (supabase) {
    const { data: registration, error } = await supabase
      .from("event_registrations")
      .select("id,event_id,creator_id,registration_status")
      .eq("id", registrationId)
      .maybeSingle();
    if (error) return { ok: false, message: error.message };
    if (!registration) return { ok: false, message: "Registration not found." };
    if (registration.registration_status !== "approved") return { ok: false, message: "Only approved creators can be checked in." };

    const checkedInAt = new Date().toISOString();
    const { data: attendance, error: attendanceError } = await supabase
      .from("event_attendance")
      .upsert(
        {
          event_id: registration.event_id,
          creator_id: registration.creator_id,
          registration_id: registration.id,
          status: "checked_in",
          checked_in_at: checkedInAt
        },
        { onConflict: "registration_id" }
      )
      .select("id")
      .single();
    if (attendanceError) return { ok: false, message: attendanceError.message };

    const { data: qr, error: qrError } = await supabase
      .from("creator_event_qr")
      .update({ attendance_id: attendance.id, status: "active" })
      .eq("registration_id", registration.id)
      .select("qr_token")
      .maybeSingle();
    if (qrError) return { ok: false, message: qrError.message };

    return { ok: true, message: "Creator checked in.", qrToken: qr?.qr_token };
  }

  const s = state();
  const registration = s.registrations.find((item) => item.id === registrationId);
  if (!registration) return { ok: false, message: "Registration not found." };
  if (registration.registration_status !== "approved") return { ok: false, message: "Only approved creators can be checked in." };

  let attendance = s.attendance.find((item) => item.registration_id === registration.id);
  if (!attendance) {
    attendance = {
      id: uid("att"),
      event_id: registration.event_id,
      creator_id: registration.creator_id,
      registration_id: registration.id,
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
      checked_in_by: "Demo Staff"
    };
    s.attendance.unshift(attendance);
  }

  const qr = ensureCreatorQr(registration, "active");
  qr.attendance_id = attendance.id;

  return { ok: true, message: "Creator checked in.", qrToken: qr.qr_token };
}

export async function validateQrForSeller(eventId: string, token: string): Promise<QrValidation> {
  const supabase = createServiceClient();
  if (supabase) {
    const { data: qrRow, error: qrError } = await supabase
      .from("creator_event_qr")
      .select("id,event_id,creator_id,registration_id,attendance_id,qr_token,qr_url,status,generated_at,last_scanned_at")
      .eq("qr_token", token)
      .maybeSingle();
    if (qrError) console.error("Failed to load QR", qrError);
    if (!qrRow) return { ok: false, code: "not_found", message: "QR token was not found." };

    const qr = qrFromRow(qrRow);
    const [eventResult, creatorResult, registrationResult, attendanceResult, claimsResult] = await Promise.all([
      supabase.from("events").select(eventSelect).eq("id", qr.event_id).maybeSingle(),
      supabase
        .from("creators")
        .select("id,full_name,tiktok_username,tiktok_profile_url,email,mobile,location,follower_count,gmv_max_total,creator_category,content_categories,affiliate_experience,profile_image,notes")
        .eq("id", qr.creator_id)
        .maybeSingle(),
      supabase
        .from("event_registrations")
        .select("id,event_id,creator_id,form_response_id,registration_status,registered_at,approved_at,notes")
        .eq("id", qr.registration_id)
        .maybeSingle(),
      qr.attendance_id
        ? supabase
          .from("event_attendance")
          .select("id,event_id,creator_id,registration_id,status,checked_in_at,checked_in_by")
          .eq("id", qr.attendance_id)
          .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("sample_claims")
        .select("id,event_id,creator_id,seller_id,brand_id,product_id,quantity,claimed_at,claimed_by,booth_id,qr_scan_id,status")
        .eq("event_id", eventId)
        .eq("creator_id", qr.creator_id)
        .eq("status", "claimed")
    ]);

    const event = eventResult.data ? eventFromRow(eventResult.data) : demoEvent;
    const creator = creatorResult.data ? creatorFromRow(creatorResult.data) : undefined;
    const registration = registrationResult.data ? registrationFromRow(registrationResult.data) : undefined;
    const attendance = attendanceResult.data ? attendanceFromRow(attendanceResult.data) : undefined;

    if (qr.event_id !== eventId) {
      return { ok: false, code: "wrong_event", message: "This QR belongs to a different event.", event, creator, qr, registration, attendance };
    }
    if (qr.status === "revoked" || registration?.registration_status === "rejected" || registration?.registration_status === "cancelled") {
      return { ok: false, code: "revoked", message: "This QR is not eligible for sample claims.", event, creator, qr, registration, attendance };
    }
    if (registration?.registration_status !== "approved") {
      return { ok: false, code: "pending_approval", message: "This creator is registered but not approved yet.", event, creator, qr, registration, attendance };
    }
    if (qr.status !== "active" || attendance?.status !== "checked_in") {
      return { ok: false, code: "not_checked_in", message: "This creator is approved but has not been checked in yet.", event, creator, qr, registration, attendance };
    }

    await supabase.from("creator_event_qr").update({ last_scanned_at: new Date().toISOString() }).eq("id", qr.id);

    return {
      ok: true,
      code: "eligible",
      message: "Creator is eligible for sample claims.",
      data: {
        event,
        creator: creator!,
        qr,
        registration: registration!,
        attendance: attendance!,
        alreadyClaimedProductIds: (claimsResult.data || []).map((claim) => String(claim.product_id))
      }
    };
  }

  const s = (await loadDbState()) || state();
  const qr = s.qrs.find((item) => item.qr_token === token);
  if (!qr) return { ok: false, code: "not_found", message: "QR token was not found." };

  const event = s.events.find((item) => item.id === qr.event_id) || demoEvent;
  const creator = s.creators.find((item) => item.id === qr.creator_id);
  const registration = s.registrations.find((item) => item.id === qr.registration_id);
  const attendance = qr.attendance_id ? s.attendance.find((item) => item.id === qr.attendance_id) : undefined;

  if (qr.event_id !== eventId) {
    return { ok: false, code: "wrong_event", message: "This QR belongs to a different event.", event, creator, qr, registration, attendance };
  }
  if (qr.status === "revoked" || registration?.registration_status === "rejected" || registration?.registration_status === "cancelled") {
    return { ok: false, code: "revoked", message: "This QR is not eligible for sample claims.", event, creator, qr, registration, attendance };
  }
  if (registration?.registration_status !== "approved") {
    return { ok: false, code: "pending_approval", message: "This creator is registered but not approved yet.", event, creator, qr, registration, attendance };
  }
  if (qr.status !== "active" || attendance?.status !== "checked_in") {
    return { ok: false, code: "not_checked_in", message: "This creator is approved but has not been checked in yet.", event, creator, qr, registration, attendance };
  }

  qr.last_scanned_at = new Date().toISOString();

  return {
    ok: true,
    code: "eligible",
    message: "Creator is eligible for sample claims.",
    data: {
      event,
      creator: creator!,
      qr,
      registration: registration!,
      attendance,
      alreadyClaimedProductIds: s.claims
        .filter((claim) => claim.event_id === eventId && claim.creator_id === qr.creator_id && claim.status === "claimed")
        .map((claim) => claim.product_id)
    }
  };
}

export async function issueSampleClaim(eventId: string, token: string, productId: string, quantity: number, allowDuplicate = false) {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return { ok: false, code: "invalid_quantity", message: "Quantity must be at least 1." };
  }

  const supabase = createServiceClient();
  if (supabase) {
    const verified = await validateQrForSeller(eventId, token);
    if (!verified.ok) return { ok: false, code: verified.code, message: verified.message };
    const s = (await loadDbState()) || state();
    const product = s.products.find((item) => item.id === productId);
    const brand = product ? s.brands.find((item) => item.id === product.brand_id) : null;
    if (!product || !brand) return { ok: false, code: "product_unavailable", message: "Product is unavailable for this event." };
    let eventProduct = s.eventProducts.find((item) => item.event_id === eventId && item.product_id === productId && item.status === "active");

    if (!eventProduct) {
      const { data: createdEventProduct, error: createEventProductError } = await supabase
        .from("event_products")
        .upsert(
          {
            event_id: eventId,
            product_id: productId,
            available_quantity: product.sample_inventory,
            max_claims_per_creator: product.max_claims_per_creator,
            status: "active"
          },
          { onConflict: "event_id,product_id" }
        )
        .select("id,event_id,product_id,available_quantity,max_claims_per_creator,status")
        .maybeSingle();
      if (createEventProductError) return { ok: false, code: "product_unavailable", message: createEventProductError.message };
      if (createdEventProduct) {
        eventProduct = eventProductFromRow(createdEventProduct);
        s.eventProducts.push(eventProduct);
      }
    }

    if (!eventProduct) return { ok: false, code: "product_unavailable", message: "Product is unavailable for this event." };

    const duplicate = s.claims.find(
      (claim) =>
        claim.event_id === eventId &&
        claim.creator_id === verified.data.creator.id &&
        claim.product_id === productId &&
        claim.status === "claimed"
    );
    if (quantity > eventProduct.available_quantity) return { ok: false, code: "out_of_stock", message: "Not enough inventory remaining." };
    if (quantity > eventProduct.max_claims_per_creator) return { ok: false, code: "limit_exceeded", message: "Requested quantity exceeds the limit per creator." };
    if (duplicate && !allowDuplicate) return { ok: false, code: "already_claimed", message: "Creator has already claimed this product.", claim: duplicate };

    const { data: updatedInventory, error: inventoryError } = await supabase
      .from("event_products")
      .update({ available_quantity: eventProduct.available_quantity - quantity })
      .eq("id", eventProduct.id)
      .gte("available_quantity", quantity)
      .select("id")
      .maybeSingle();
    if (inventoryError) return { ok: false, code: "inventory_error", message: inventoryError.message };
    if (!updatedInventory) return { ok: false, code: "out_of_stock", message: "Not enough inventory remaining." };

    const { data: scan } = await supabase
      .from("qr_scans")
      .insert({
        event_id: eventId,
        seller_id: brand.seller_id,
        creator_id: verified.data.creator.id,
        qr_id: verified.data.qr.id,
        result: "valid"
      })
      .select("id")
      .single();

    const { data: claim, error: claimError } = await supabase
      .from("sample_claims")
      .insert({
        event_id: eventId,
        creator_id: verified.data.creator.id,
        seller_id: brand.seller_id,
        brand_id: brand.id,
        product_id: product.id,
        quantity,
        qr_scan_id: scan?.id,
        status: "claimed"
      })
      .select("id,event_id,creator_id,seller_id,brand_id,product_id,quantity,claimed_at,claimed_by,booth_id,qr_scan_id,status")
      .single();
    if (claimError) return { ok: false, code: "claim_error", message: claimError.message };

    await supabase.from("creator_event_qr").update({ last_scanned_at: new Date().toISOString() }).eq("id", verified.data.qr.id);
    return { ok: true, code: "claimed", message: "Sample claimed.", claim: claimFromRow(claim) };
  }

  const s = state();
  const verified = await validateQrForSeller(eventId, token);
  if (!verified.ok) return { ok: false, code: verified.code, message: verified.message };

  const product = s.products.find((item) => item.id === productId);
  const brand = product ? s.brands.find((item) => item.id === product.brand_id) : null;
  if (!product || !brand) return { ok: false, code: "product_unavailable", message: "Product is unavailable for this event." };
  let eventProduct = s.eventProducts.find((item) => item.event_id === eventId && item.product_id === productId && item.status === "active");
  if (!eventProduct) {
    eventProduct = {
      id: uid("evp"),
      event_id: eventId,
      product_id: productId,
      available_quantity: product.sample_inventory,
      max_claims_per_creator: product.max_claims_per_creator,
      status: "active"
    };
    s.eventProducts.unshift(eventProduct);
  }

  const duplicate = s.claims.find(
    (claim) =>
      claim.event_id === eventId &&
      claim.creator_id === verified.data.creator.id &&
      claim.product_id === productId &&
      claim.status === "claimed"
  );
  if (duplicate && !allowDuplicate) return { ok: false, code: "already_claimed", message: "Creator has already claimed this product.", claim: duplicate };

  if (quantity > eventProduct.available_quantity) return { ok: false, code: "out_of_stock", message: "Not enough inventory remaining." };
  if (quantity > eventProduct.max_claims_per_creator) return { ok: false, code: "limit_exceeded", message: "Requested quantity exceeds the limit per creator." };

  eventProduct.available_quantity -= quantity;
  const claim: SampleClaim = {
    id: uid("cla"),
    event_id: eventId,
    creator_id: verified.data.creator.id,
    seller_id: brand.seller_id,
    brand_id: brand.id,
    product_id: product.id,
    quantity,
    claimed_at: new Date().toISOString(),
    claimed_by: "Demo Seller Staff",
    booth_id: s.eventSellers.find((eventSeller) => eventSeller.event_id === eventId && eventSeller.seller_id === brand.seller_id)?.booth_number,
    qr_scan_id: uid("scan"),
    status: "claimed"
  };
  s.claims.unshift(claim);

  return { ok: true, code: "claimed", message: "Sample claimed.", claim };
}

export async function listSellerDashboard(eventId?: string) {
  const supabase = createServiceClient();
  if (supabase) {
    const { data: sellerRow, error: sellerError } = await supabase
      .from("sellers")
      .select(sellerSelect)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sellerError) console.error("Failed to load seller dashboard", sellerError);
    if (!sellerRow) {
      const s = state();
      return {
        event: demoEvent,
        seller: demoSeller,
        eventSeller: demoEventSeller,
        brands: s.brands,
        products: s.products,
        eventProducts: s.eventProducts,
        claims: s.claims,
        creatorsScanned: 0,
        uniqueCreators: 0,
        samplesIssued: 0
      };
    }

    const seller = sellerFromRow(sellerRow);
    const { data: brandRows } = await supabase
      .from("brands")
      .select("id,seller_id,brand_name,logo_url,description,status")
      .eq("seller_id", seller.id);
    const brands = (brandRows || []).map(brandFromRow);
    const brandIds = unique(brands.map((brand) => brand.id));

    let eventSellerQuery = supabase
      .from("event_sellers")
      .select("id,event_id,seller_id,booth_name,booth_number,status")
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false });
    if (eventId) eventSellerQuery = eventSellerQuery.eq("event_id", eventId);

    let claimsQuery = supabase
      .from("sample_claims")
      .select("id,event_id,creator_id,seller_id,brand_id,product_id,quantity,claimed_at,claimed_by,booth_id,qr_scan_id,status")
      .eq("seller_id", seller.id)
      .eq("status", "claimed");
    if (eventId) claimsQuery = claimsQuery.eq("event_id", eventId);

    let scansQuery = supabase.from("qr_scans").select("id", { count: "exact", head: true }).eq("seller_id", seller.id);
    if (eventId) scansQuery = scansQuery.eq("event_id", eventId);

    const [productResult, eventSellerResult, claimsResult, scansResult] = await Promise.all([
      brandIds.length
        ? supabase
          .from("products")
          .select(productSelect)
          .in("brand_id", brandIds)
        : Promise.resolve({ data: [], error: null }),
      eventSellerQuery.limit(1),
      claimsQuery,
      scansQuery
    ]);

    const products = (productResult.data || []).map(productFromRow);
    const productIds = unique(products.map((product) => product.id));
    const selectedEvent = eventId ? await getEventById(eventId) : null;
    const eventSeller = eventSellerResult.data?.[0]
      ? eventSellerFromRow(eventSellerResult.data[0])
      : selectedEvent
        ? { ...demoEventSeller, event_id: selectedEvent.id, seller_id: seller.id }
        : demoEventSeller;
    const claims = (claimsResult.data || []).map(claimFromRow);
    const event = selectedEvent || (await getEventById(eventSeller.event_id));

    let eventProductQuery = productIds.length
      ? supabase
        .from("event_products")
        .select("id,event_id,product_id,available_quantity,max_claims_per_creator,status")
        .in("product_id", productIds)
      : null;
    if (eventProductQuery && eventId) eventProductQuery = eventProductQuery.eq("event_id", eventId);

    const { data: eventProductRows } = eventProductQuery ? await eventProductQuery : { data: [] };
    const eventProducts = (eventProductRows || []).map(eventProductFromRow);
    const selectedEventId = eventId || eventSeller.event_id;
    const existingEventProductKeys = new Set(eventProducts.map((item) => `${item.event_id}:${item.product_id}`));
    if (selectedEventId) {
      for (const product of products) {
        const key = `${selectedEventId}:${product.id}`;
        if (existingEventProductKeys.has(key)) continue;
        eventProducts.push({
          id: "",
          event_id: selectedEventId,
          product_id: product.id,
          available_quantity: product.sample_inventory,
          max_claims_per_creator: product.max_claims_per_creator,
          status: "active"
        });
      }
    }

    const uniqueCreators = new Set(claims.map((claim) => claim.creator_id));
    return {
      event: event || demoEvent,
      seller,
      eventSeller,
      brands,
      products,
      eventProducts,
      claims,
      creatorsScanned: scansResult.count || 0,
      uniqueCreators: uniqueCreators.size,
      samplesIssued: claims.reduce((total, claim) => total + claim.quantity, 0)
    };
  }

  const s = (await loadDbState()) || state();
  const seller = s.sellers[0] || demoSeller;
  const eventSeller =
    s.eventSellers.find((item) => item.seller_id === seller.id && (!eventId || item.event_id === eventId)) ||
    demoEventSeller;
  const claims = s.claims.filter(
    (claim) => claim.status === "claimed" && claim.seller_id === seller.id && (!eventId || claim.event_id === eventSeller.event_id)
  );
  const uniqueCreators = new Set(claims.map((claim) => claim.creator_id));

  return {
    event: s.events.find((event) => event.id === eventSeller.event_id) || s.events[0] || demoEvent,
    seller,
    eventSeller,
    brands: s.brands,
    products: s.products,
    eventProducts: s.eventProducts.filter((item) => !eventId || item.event_id === eventSeller.event_id),
    claims,
    creatorsScanned: s.qrs.filter((qr) => qr.last_scanned_at && (!eventId || qr.event_id === eventSeller.event_id)).length,
    uniqueCreators: uniqueCreators.size,
    samplesIssued: claims.reduce((total, claim) => total + claim.quantity, 0)
  };
}

export async function getClaimRows(eventId?: string) {
  const supabase = createServiceClient();
  if (supabase) {
    const claimQuery = supabase
      .from("sample_claims")
      .select("id,event_id,creator_id,seller_id,brand_id,product_id,quantity,claimed_at,claimed_by,booth_id,qr_scan_id,status")
      .order("claimed_at", { ascending: false });
    if (eventId) claimQuery.eq("event_id", eventId);
    const { data: claimRows, error } = await claimQuery;
    if (error) {
      console.error("Failed to load claims", error);
      return [];
    }
    const claims = (claimRows || []).map(claimFromRow);
    if (!claims.length) return [];

    const [eventsResult, creatorsResult, brandsResult, productsResult] = await Promise.all([
      supabase.from("events").select(eventSelect).in("id", unique(claims.map((claim) => claim.event_id))),
      supabase
        .from("creators")
        .select("id,full_name,tiktok_username,tiktok_profile_url,email,mobile,location,follower_count,gmv_max_total,creator_category,content_categories,affiliate_experience,profile_image,notes")
        .in("id", unique(claims.map((claim) => claim.creator_id))),
      supabase.from("brands").select("id,seller_id,brand_name,logo_url,description,status").in("id", unique(claims.map((claim) => claim.brand_id))),
      supabase
        .from("products")
        .select(productSelect)
        .in("id", unique(claims.map((claim) => claim.product_id)))
    ]);

    const events = mapById((eventsResult.data || []).map(eventFromRow));
    const creators = mapById((creatorsResult.data || []).map(creatorFromRow));
    const brands = mapById((brandsResult.data || []).map(brandFromRow));
    const products = mapById((productsResult.data || []).map(productFromRow));

    return claims
      .map((claim) => ({
        claim,
        event: events.get(claim.event_id) || demoEvent,
        creator: creators.get(claim.creator_id)!,
        brand: brands.get(claim.brand_id)!,
        product: products.get(claim.product_id)!
      }))
      .filter((row) => row.creator && row.brand && row.product);
  }

  const s = (await loadDbState()) || state();
  return s.claims.filter((claim) => !eventId || claim.event_id === eventId).map((claim) => ({
    claim,
    event: s.events.find((event) => event.id === claim.event_id) || demoEvent,
    creator: s.creators.find((creator) => creator.id === claim.creator_id)!,
    brand: s.brands.find((brand) => brand.id === claim.brand_id)!,
    product: s.products.find((product) => product.id === claim.product_id)!
  }));
}

export async function listSellerProductRows() {
  const dashboard = await listSellerDashboard();
  const claims = dashboard.claims;

  return dashboard.products.map((product) => {
    const brand = dashboard.brands.find((item) => item.id === product.brand_id)!;
    const eventProducts = dashboard.eventProducts.filter((item) => item.product_id === product.id);
    const issued = claims
      .filter((claim) => claim.product_id === product.id)
      .reduce((total, claim) => total + claim.quantity, 0);
    const remaining = eventProducts.length
      ? eventProducts.reduce((total, item) => total + item.available_quantity, 0)
      : product.sample_inventory;

    return { product, brand, issued, remaining, eventProducts };
  });
}

export async function getQrPage(token: string) {
  const supabase = createServiceClient();
  if (supabase) {
    const { data: qrRow, error } = await supabase
      .from("creator_event_qr")
      .select("id,event_id,creator_id,registration_id,attendance_id,qr_token,qr_url,status,generated_at,last_scanned_at")
      .eq("qr_token", token)
      .maybeSingle();
    if (error) console.error("Failed to load QR page", error);
    if (!qrRow) return null;

    const qr = qrFromRow(qrRow);
    const [eventResult, creatorResult, registrationResult, attendanceResult] = await Promise.all([
      supabase.from("events").select(eventSelect).eq("id", qr.event_id).maybeSingle(),
      supabase
        .from("creators")
        .select("id,full_name,tiktok_username,tiktok_profile_url,email,mobile,location,follower_count,gmv_max_total,creator_category,content_categories,affiliate_experience,profile_image,notes")
        .eq("id", qr.creator_id)
        .maybeSingle(),
      supabase
        .from("event_registrations")
        .select("id,event_id,creator_id,form_response_id,registration_status,registered_at,approved_at,notes")
        .eq("id", qr.registration_id)
        .maybeSingle(),
      qr.attendance_id
        ? supabase
          .from("event_attendance")
          .select("id,event_id,creator_id,registration_id,status,checked_in_at,checked_in_by")
          .eq("id", qr.attendance_id)
          .maybeSingle()
        : Promise.resolve({ data: null, error: null })
    ]);

    if (!eventResult.data || !creatorResult.data) return null;
    return {
      event: eventFromRow(eventResult.data),
      creator: creatorFromRow(creatorResult.data),
      registration: registrationResult.data ? registrationFromRow(registrationResult.data) : undefined,
      attendance: attendanceResult.data ? attendanceFromRow(attendanceResult.data) : undefined,
      qr
    };
  }

  const s = (await loadDbState()) || state();
  const qr = s.qrs.find((item) => item.qr_token === token);
  if (!qr) return null;
  return {
    event: s.events.find((event) => event.id === qr.event_id) || demoEvent,
    creator: s.creators.find((item) => item.id === qr.creator_id)!,
    registration: s.registrations.find((item) => item.id === qr.registration_id),
    attendance: qr.attendance_id ? s.attendance.find((item) => item.id === qr.attendance_id) : undefined,
    qr
  };
}
