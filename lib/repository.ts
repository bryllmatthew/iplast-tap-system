import "server-only";

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
import { siteUrl } from "@/lib/env";
import type {
  Attendance,
  Brand,
  Creator,
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
};

const defaultOrganizationId = "00000000-0000-0000-0000-000000000001";
const eventSelect =
  "id,event_name,event_slug,description,venue,address,event_date,start_time,end_time,registration_start,registration_end,maximum_creator_capacity,poster_url,status";

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
  return {
    id: String(row.id),
    company_name: String(row.company_name || ""),
    contact_name: String(row.contact_name || ""),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
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
    qr_url: String(row.qr_url || `${siteUrl()}/qr/${row.qr_token}`),
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

async function listDbEvents() {
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

async function loadDbState(): Promise<DemoState | null> {
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
    supabase.from("sellers").select("id,company_name,contact_name,email,phone,logo_url,status").order("created_at", { ascending: false }),
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
    supabase.from("products").select("id,brand_id,product_name,sku,image_url,description,sample_inventory,max_claims_per_creator,status"),
    supabase.from("event_products").select("id,event_id,product_id,available_quantity,max_claims_per_creator,status"),
    supabase.from("sample_claims").select("id,event_id,creator_id,seller_id,brand_id,product_id,quantity,claimed_at,claimed_by,booth_id,qr_scan_id,status"),
    supabase.from("seller_invites").select("id,seller_id,email,login_url,temporary_password,created_at,status")
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
      email: String(invite.email),
      login_url: String(invite.login_url),
      temporary_password: String(invite.temporary_password),
      created_at: String(invite.created_at),
      status: String(invite.status || "queued") as SellerInvite["status"]
    }))
  };
}

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
      sellerInvites: []
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

  return global.tapDemoState;
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
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
      qr_url: `${siteUrl()}/qr/${token}`,
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
  if (supabase) {
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

    let formId = existingForm?.id;
    let versionId = existingForm?.active_version_id;

    if (!formId) {
      const { data: form, error } = await supabase.from("event_forms").insert({ event_id: eventId }).select("id").single();
      if (error) throw error;
      formId = form.id;
    }

    if (!versionId) {
      const { data: version, error } = await supabase
        .from("event_form_versions")
        .insert({
          form_id: formId,
          version_number: 1,
          status: "published",
          published_at: new Date().toISOString()
        })
        .select("id")
        .single();
      if (error) throw error;
      versionId = version.id;

      const { error: fieldsError } = await supabase.from("event_form_fields").insert(
        demoForm.fields.map((field) => ({
          form_version_id: versionId,
          label: field.label,
          field_key: field.id,
          field_type: field.field_type,
          required: field.required,
          options: field.options || [],
          sort_order: field.sort_order
        }))
      );
      if (fieldsError) throw fieldsError;

      const { error: updateError } = await supabase.from("event_forms").update({ active_version_id: versionId }).eq("id", formId);
      if (updateError) throw updateError;
    }

    const { data: fields, error: fieldsError } = await supabase
      .from("event_form_fields")
      .select("label,field_key,field_type,required,options,sort_order")
      .eq("form_version_id", versionId)
      .order("sort_order");
    if (fieldsError) throw fieldsError;

    return {
      id: String(versionId),
      event_id: eventId,
      version_number: 1,
      status: "published",
      published_at: new Date().toISOString(),
      fields: fields.map((field) => ({
        id: String(field.field_key),
        label: String(field.label),
        field_type: String(field.field_type) as FormField["field_type"],
        required: Boolean(field.required),
        options: Array.isArray(field.options) ? field.options.map(String) : [],
        sort_order: Number(field.sort_order)
      }))
    } satisfies FormVersion;
  }

  return {
    ...demoForm,
    id: `formv_${eventId}_1`,
    event_id: eventId
  };
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
    return { ok: true, message: "Event created.", event: eventFromRow(data) };
  }

  state().events.unshift(event);
  return { ok: true, message: "Event created.", event };
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

function parseLines(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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

export async function addEventSeller(formData: FormData, logoUrl?: string) {
  const eventId = String(formData.get("event_id") || "");
  const sellerName = String(formData.get("seller_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const boothNumber = String(formData.get("booth_number") || "").trim();
  const boothName = String(formData.get("booth_name") || sellerName).trim();
  const password = String(formData.get("password") || "").trim();
  const brandLines = parseLines(formData.get("brands"));
  const productBrands = formData.getAll("product_brand").map((value) => String(value).trim());
  const productNames = formData.getAll("product_name").map((value) => String(value).trim());
  const productQuantities = formData.getAll("product_quantity").map((value) => Number(value || 0));

  if (!eventId || !sellerName || !email || !boothNumber || !password) {
    return { ok: false, message: "Seller name, email, password, event, and booth number are required." };
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

    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .insert({
        organization_id: defaultOrganizationId,
        company_name: sellerName,
        contact_name: sellerName,
        email,
        phone: String(formData.get("phone") || "").trim(),
        logo_url: logoUrl,
        status: "active"
      })
      .select("id,company_name,contact_name,email,phone,logo_url,status")
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

    const brandNames = brandLines.length ? brandLines : [`${sellerName} Brand`];
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
      email,
      login_url: `${siteUrl()}/seller`,
      temporary_password: password,
      created_at: new Date().toISOString(),
      status: "queued"
    };
    await supabase.from("seller_invites").insert(invite);

    return { ok: true, message: "Seller added and login email queued.", seller: sellerFromRow(seller), invite };
  }

  const s = state();
  if (!s.events.some((event) => event.id === eventId)) {
    return { ok: false, message: "Event not found." };
  }
  if (s.eventSellers.some((eventSeller) => eventSeller.event_id === eventId && eventSeller.booth_number.toLowerCase() === boothNumber.toLowerCase())) {
    return { ok: false, message: "That booth number is already assigned for this event." };
  }

  const seller: Seller = {
    id: uid("sel"),
    company_name: sellerName,
    contact_name: sellerName,
    email,
    phone: String(formData.get("phone") || "").trim(),
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
  for (const brandName of brandLines.length ? brandLines : [`${sellerName} Brand`]) {
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
    email,
    login_url: `${siteUrl()}/seller`,
    temporary_password: password,
    created_at: new Date().toISOString(),
    status: "queued"
  };
  s.sellerInvites.unshift(invite);
  return { ok: true, message: "Seller added and login email queued.", seller, invite };
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
        image_url: String(formData.get("image_url") || "").trim() || null,
        description: String(formData.get("description") || "").trim(),
        sample_inventory: sampleInventory,
        max_claims_per_creator: maxClaimsPerCreator,
        status: "active"
      })
      .select("id,brand_id,product_name,sku,image_url,description,sample_inventory,max_claims_per_creator,status")
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
  const s = (await loadDbState()) || state();

  return s.attendance
    .filter((attendance) => attendance.status === "checked_in")
    .map((attendance) => {
      const creator = s.creators.find((item) => item.id === attendance.creator_id)!;
      const registration = s.registrations.find((item) => item.id === attendance.registration_id)!;
      const event = s.events.find((item) => item.id === attendance.event_id) || demoEvent;
      const claims = s.claims.filter((claim) => claim.creator_id === creator.id && claim.status === "claimed");
      return { creator, attendance, registration, event, claims };
    })
    .filter(({ creator }) => {
      if (!needle) return true;
      return [creator.full_name, creator.tiktok_username, creator.email, creator.mobile].some((value) =>
        value.toLowerCase().includes(needle)
      );
    });
}

export async function getCreatorDetail(creatorId: string) {
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

  return { creator, registrations, sampleClaims };
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
          gmv_max_total: Number(answers.gmv_max_total || 0),
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
        qr_url: `${siteUrl()}/qr/${token}`,
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
      gmv_max_total: Number(answers.gmv_max_total || 0),
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

export async function issueSampleClaim(eventId: string, token: string, productId: string, quantity: number) {
  const supabase = createServiceClient();
  if (supabase) {
    const verified = await validateQrForSeller(eventId, token);
    if (!verified.ok) return { ok: false, code: verified.code, message: verified.message };
    const s = (await loadDbState()) || state();
    const eventProduct = s.eventProducts.find((item) => item.event_id === eventId && item.product_id === productId && item.status === "active");
    const product = s.products.find((item) => item.id === productId);
    const brand = product ? s.brands.find((item) => item.id === product.brand_id) : null;
    if (!eventProduct || !product || !brand) return { ok: false, code: "product_unavailable", message: "Product is unavailable for this event." };

    const duplicate = s.claims.find(
      (claim) =>
        claim.event_id === eventId &&
        claim.creator_id === verified.data.creator.id &&
        claim.product_id === productId &&
        claim.status === "claimed"
    );
    if (duplicate) return { ok: false, code: "already_claimed", message: "Creator has already claimed this product.", claim: duplicate };
    if (quantity > eventProduct.available_quantity) return { ok: false, code: "out_of_stock", message: "Not enough inventory remaining." };
    if (quantity > eventProduct.max_claims_per_creator) return { ok: false, code: "limit_exceeded", message: "Requested quantity exceeds the claim limit." };

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
    if (claimError) return { ok: false, code: "already_claimed", message: "Creator has already claimed this product." };

    await supabase.from("creator_event_qr").update({ last_scanned_at: new Date().toISOString() }).eq("id", verified.data.qr.id);
    return { ok: true, code: "claimed", message: "Sample claimed.", claim: claimFromRow(claim) };
  }

  const s = state();
  const verified = await validateQrForSeller(eventId, token);
  if (!verified.ok) return { ok: false, code: verified.code, message: verified.message };

  const eventProduct = s.eventProducts.find((item) => item.event_id === eventId && item.product_id === productId && item.status === "active");
  const product = s.products.find((item) => item.id === productId);
  const brand = product ? s.brands.find((item) => item.id === product.brand_id) : null;
  if (!eventProduct || !product || !brand) return { ok: false, code: "product_unavailable", message: "Product is unavailable for this event." };

  const duplicate = s.claims.find(
    (claim) =>
      claim.event_id === eventId &&
      claim.creator_id === verified.data.creator.id &&
      claim.product_id === productId &&
      claim.status === "claimed"
  );
  if (duplicate) return { ok: false, code: "already_claimed", message: "Creator has already claimed this product.", claim: duplicate };

  if (quantity > eventProduct.available_quantity) return { ok: false, code: "out_of_stock", message: "Not enough inventory remaining." };
  if (quantity > eventProduct.max_claims_per_creator) return { ok: false, code: "limit_exceeded", message: "Requested quantity exceeds the claim limit." };

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

export async function listSellerDashboard() {
  const s = (await loadDbState()) || state();
  const claims = s.claims.filter((claim) => claim.status === "claimed");
  const uniqueCreators = new Set(claims.map((claim) => claim.creator_id));
  const seller = s.sellers[0] || demoSeller;
  const eventSeller = s.eventSellers.find((item) => item.seller_id === seller.id) || demoEventSeller;

  return {
    event: s.events.find((event) => event.id === eventSeller.event_id) || s.events[0] || demoEvent,
    seller,
    eventSeller,
    brands: s.brands,
    products: s.products,
    eventProducts: s.eventProducts,
    claims,
    creatorsScanned: s.qrs.filter((qr) => qr.last_scanned_at).length,
    uniqueCreators: uniqueCreators.size,
    samplesIssued: claims.reduce((total, claim) => total + claim.quantity, 0)
  };
}

export async function getClaimRows() {
  const s = (await loadDbState()) || state();
  return s.claims.map((claim) => ({
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
    const remaining = eventProducts.reduce((total, item) => total + item.available_quantity, 0);

    return { product, brand, issued, remaining, eventProducts };
  });
}

export async function getQrPage(token: string) {
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
