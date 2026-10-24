import "server-only";

import { redirect } from "next/navigation";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { cleanEnv } from "@/lib/clean-env";
import { siteUrl } from "@/lib/env";
import { sellerAuthEmailFromIdentifier, sellerUsernameToAuthEmail } from "@/lib/seller-login";
import type { Creator, Role, Seller } from "@/lib/types";

const adminUsername = "TAPAdmin";
const adminEmail = process.env.TAP_ADMIN_EMAIL || "tapadmin@iplast.ai";
const adminPassword = process.env.TAP_ADMIN_PASSWORD || "iPlastTAP123!";
const defaultOrganizationId = "00000000-0000-0000-0000-000000000001";

function createServiceClient() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

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
  const authEmail = sellerUsernameToAuthEmail(seller.username || seller.email.split("@")[0] || seller.company_name);
  const user = await ensureAuthUser(authEmail, password, seller.contact_name || seller.company_name);
  const admin = createServiceClient();

  await admin.from("profiles").upsert({
    id: user.id,
    full_name: seller.contact_name || seller.company_name,
    email: authEmail
  });

  const { data: existingSeller } = await admin.from("sellers").select("id").eq("id", seller.id).limit(1).maybeSingle();
  const { data: dbSeller, error: sellerError } = existingSeller
    ? { data: existingSeller, error: null }
    : await admin
    .from("sellers")
    .insert({
      organization_id: defaultOrganizationId,
      company_name: seller.company_name,
      contact_name: seller.contact_name,
      username: seller.username,
      email: authEmail,
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
  return user;
}

export async function ensureCreatorAuthUser(creator: Creator, email: string, password: string, invitedBy?: string) {
  const user = await ensureAuthUser(email, password, creator.full_name);
  const admin = createServiceClient();
  const now = new Date().toISOString();

  await admin.from("profiles").upsert({
    id: user.id,
    full_name: creator.full_name,
    email
  });

  const { error } = await admin.from("creator_accounts").upsert(
    {
      creator_id: creator.id,
      user_id: user.id,
      email,
      status: "active",
      invited_by: invitedBy || null,
      invited_at: now,
      activated_at: now,
      updated_at: now
    },
    { onConflict: "creator_id" }
  );
  if (error) throw error;

  return user;
}

export async function inviteCreatorPortalAccess(creator: Pick<Creator, "id" | "full_name">, email: string) {
  const admin = createServiceClient();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await findAuthUserByEmail(normalizedEmail);
  let user = existing;

  if (!user) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(normalizedEmail, {
      data: { full_name: creator.full_name },
      redirectTo: `${siteUrl()}/auth/callback?next=/creator/set-password`
    });
    if (error) throw error;
    user = data.user;
  }

  if (!user) throw new Error("Creator invitation did not return an auth user.");

  await admin.from("profiles").upsert({
    id: user.id,
    full_name: creator.full_name,
    email: normalizedEmail
  });

  const { error } = await admin.from("creator_accounts").upsert(
    {
      creator_id: creator.id,
      user_id: user.id,
      email: normalizedEmail,
      status: existing ? "active" : "pending",
      invited_at: new Date().toISOString(),
      activated_at: existing ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "creator_id" }
  );
  if (error) throw error;

  return { invited: !existing, email: normalizedEmail };
}

export async function activateCreatorAccount(userId: string) {
  const admin = createServiceClient();
  const { error } = await admin
    .from("creator_accounts")
    .update({ status: "active", activated_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
}

export function loginIdentifierToEmail(role: string, identifier: string) {
  if (role !== "seller" && identifier === adminUsername) return adminEmail;
  if (role === "seller") return sellerAuthEmailFromIdentifier(identifier);
  return identifier;
}

export async function userHasRole(userId: string, role: "admin" | "seller" | "creator") {
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

  if (role === "seller") {
    const { data } = await supabase.from("seller_users").select("id").eq("user_id", userId).limit(1);
    return Boolean(data?.length);
  }

  const { data } = await supabase
    .from("creator_accounts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1);
  return Boolean(data?.length);
}

export async function requireAuth(role: Role | "admin" | "seller" | "creator") {
  const supabase = await createClient();
  const expected =
    role === "seller_admin" || role === "seller_staff" || role === "seller"
      ? "seller"
      : role === "creator"
        ? "creator"
        : "admin";
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !(await userHasRole(user.id, expected))) {
    redirect(`/login?next=${expected === "seller" ? "/seller" : expected === "creator" ? "/creator" : "/admin"}&role=${expected}`);
  }

  return user;
}
