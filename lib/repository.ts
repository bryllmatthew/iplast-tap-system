import "server-only";

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
  Product,
  Registration,
  RegistrationRow,
  QrValidation,
  SampleClaim,
  Seller,
  SellerInvite,
  SellerLogin
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
  sellerLogins: SellerLogin[];
};

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
      sellerLogins: [
        {
          seller_id: demoSeller.id,
          email: demoSeller.email,
          password: "SellerDemo123!"
        }
      ]
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
  if (!global.tapDemoState.sellerLogins) {
    global.tapDemoState.sellerLogins = [
      {
        seller_id: demoSeller.id,
        email: demoSeller.email,
        password: "SellerDemo123!"
      }
    ];
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
  return state().events;
}

export async function listSellerEvents() {
  const s = state();
  return s.eventSellers.map((eventSeller) => ({
    event: s.events.find((event) => event.id === eventSeller.event_id) || demoEvent,
    eventSeller
  }));
}

export async function getEventBySlug(slug: string) {
  return state().events.find((event) => event.event_slug === slug) || null;
}

export async function getEventById(id: string) {
  return state().events.find((event) => event.id === id) || null;
}

export async function getPublishedForm(eventId: string) {
  const event = await getEventById(eventId);
  if (!event) return null;
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
  const id = uid("evt");
  const slugCandidate = `${slugBase}-${eventDate}`.replace(/[^a-z0-9-]+/g, "-");
  const existingSlugs = new Set(state().events.map((event) => event.event_slug));
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

  state().events.unshift(event);
  return { ok: true, message: "Event created.", event };
}

export async function updateEventBanner(eventId: string, posterUrl: string) {
  const event = state().events.find((item) => item.id === eventId);
  if (!event) return { ok: false, message: "Event not found." };
  if (!posterUrl) return { ok: false, message: "Banner image is required." };

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
  const s = state();
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
  const s = state();
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
  s.sellerLogins.unshift({
    seller_id: seller.id,
    email,
    password
  });

  return { ok: true, message: "Seller added and login email queued.", seller, invite };
}

export async function validateSellerLogin(email: string, password: string) {
  const s = state();
  const login = s.sellerLogins.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  if (!login) return null;
  return s.sellers.find((seller) => seller.id === login.seller_id) || null;
}

export async function addBrand(formData: FormData) {
  const s = state();
  const brandName = String(formData.get("brand_name") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!brandName) return { ok: false, message: "Brand name is required." };

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
  const s = state();
  const brandId = String(formData.get("brand_id") || "");
  const productName = String(formData.get("product_name") || "").trim();
  const inventory = Number(formData.get("sample_inventory") || 0);
  const maxClaims = Number(formData.get("max_claims_per_creator") || 1);

  if (!brandId || !productName) return { ok: false, message: "Brand and product name are required." };
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
  const s = state();
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
  const s = state();

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
  const s = state();

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
  const s = state();
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

  const s = state();
  const mobile = String(answers.mobile || "");
  const email = String(answers.email || "");
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
  const s = state();
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
  const s = state();
  const claims = s.claims.filter((claim) => claim.status === "claimed");
  const uniqueCreators = new Set(claims.map((claim) => claim.creator_id));
  const seller = s.sellers[0] || demoSeller;
  const eventSeller = s.eventSellers.find((item) => item.seller_id === seller.id) || demoEventSeller;

  return {
    event: demoEvent,
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
  const s = state();
  return s.claims.map((claim) => ({
    claim,
    event: demoEvent,
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
  const s = state();
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
