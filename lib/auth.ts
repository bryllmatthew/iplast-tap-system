import "server-only";

import { redirect } from "next/navigation";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Role, Seller } from "@/lib/types";

const adminUsername = "TAPAdmin";
const adminEmail = process.env.TAP_ADMIN_EMAIL || "tapadmin@iplast.ai";
const adminPassword = process.env.TAP_ADMIN_PASSWORD || "iPlastTAP123!";
const defaultOrganizationId = "00000000-0000-0000-0000-000000000001";
const defaultEventId = "10000000-0000-0000-0000-000000000001";

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase service environment variables.");
  }

  return createSupabaseAdmin(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function findAuthUserByEmail(email: string) {
  const admin = createServiceClient();
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;
  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null;
}

async function ensureAuthUser(email: string, password: string, fullName: string) {
  const admin = createServiceClient();
  const existing = await findAuthUserByEmail(email);

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });
  if (error) throw error;
  return data.user;
}

export async function ensureDefaultAdminUser() {
  const user = await ensureAuthUser(adminEmail, adminPassword, "TAP Admin");
  const admin = createServiceClient();

  await admin.from("profiles").upsert({
    id: user.id,
    full_name: "TAP Admin",
    email: adminEmail
  });
  await admin.from("organization_users").upsert(
    {
      organization_id: defaultOrganizationId,
      user_id: user.id,
      role: "super_admin"
    },
    { onConflict: "organization_id,user_id,role" }
  );

  return user;
}

export async function ensureSellerAuthUser(seller: Seller, password: string) {
  const user = await ensureAuthUser(seller.email, password, seller.contact_name || seller.company_name);
  const admin = createServiceClient();

  await admin.from("profiles").upsert({
    id: user.id,
    full_name: seller.contact_name || seller.company_name,
    email: seller.email
  });

  const { data: existingSeller } = await admin.from("sellers").select("id").eq("email", seller.email).limit(1).maybeSingle();
  const { data: dbSeller, error: sellerError } = existingSeller
    ? { data: existingSeller, error: null }
    : await admin
    .from("sellers")
    .insert({
      organization_id: defaultOrganizationId,
      company_name: seller.company_name,
      contact_name: seller.contact_name,
      email: seller.email,
      phone: seller.phone,
      logo_url: seller.logo_url,
      status: seller.status
    })
    .select("id")
    .single();

  if (sellerError) throw sellerError;

  await admin.from("seller_users").upsert(
    {
      seller_id: dbSeller.id,
      user_id: user.id,
      role: "seller_admin"
    },
    { onConflict: "seller_id,user_id" }
  );
  await admin.from("event_sellers").upsert(
    {
      event_id: defaultEventId,
      seller_id: dbSeller.id,
      booth_name: `${seller.company_name} Booth`,
      booth_number: "Assigned by TAP",
      status: "active"
    },
    { onConflict: "event_id,seller_id" }
  );

  return user;
}

export function loginIdentifierToEmail(role: string, identifier: string) {
  if (role !== "seller" && identifier === adminUsername) return adminEmail;
  return identifier;
}

export async function userHasRole(userId: string, role: "admin" | "seller") {
  const supabase = createServiceClient();

  if (role === "admin") {
    const { data } = await supabase
      .from("organization_users")
      .select("id")
      .eq("user_id", userId)
      .in("role", ["super_admin", "event_admin", "event_staff"])
      .limit(1);
    return Boolean(data?.length);
  }

  const { data } = await supabase.from("seller_users").select("id").eq("user_id", userId).limit(1);
  return Boolean(data?.length);
}

export async function requireAuth(role: Role | "admin" | "seller") {
  const supabase = await createClient();
  const expected = role === "seller_admin" || role === "seller_staff" || role === "seller" ? "seller" : "admin";
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !(await userHasRole(user.id, expected))) {
    redirect(`/login?next=${expected === "seller" ? "/seller" : "/admin"}&role=${expected}`);
  }

  return user;
}
