"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

import {
  addBrand,
  addEventSeller,
  addProduct,
  checkInCreator,
  createEvent,
  deleteEvent,
  deleteSeller,
  issueSampleClaim,
  setRegistrationStatus,
  submitRegistration,
  updateSeller,
  updateProduct,
  updateEventBanner
} from "@/lib/repository";
import { ensureDefaultAdminUser, ensureSellerAuthUser, loginIdentifierToEmail, requireAuth, userHasRole } from "@/lib/auth";
import { cleanEnv } from "@/lib/clean-env";
import { createClient } from "@/lib/supabase/server";

async function savePublicUpload(file: File) {
  const extension = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`.replace(/[^a-zA-Z0-9._-]/g, "");
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (url && key) {
    const supabase = createSupabaseAdmin(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const bucket = "tap-public-assets";
    const objectPath = `uploads/${filename}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: bucketError } = await supabase.storage.createBucket(bucket, { public: true });
    const bucketStatus =
      (bucketError as { status?: number | string; statusCode?: number | string } | null)?.status ??
      (bucketError as { status?: number | string; statusCode?: number | string } | null)?.statusCode;
    if (bucketError && bucketStatus !== 409 && !/already exists|resource already exists/i.test(bucketError.message)) {
      throw bucketError;
    }

    const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, bytes, {
      cacheControl: "31536000",
      contentType: file.type || "application/octet-stream",
      upsert: true
    });
    if (uploadError) throw uploadError;

    return supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}

export async function loginAction(formData: FormData) {
  const role = String(formData.get("role") || "admin");
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || (role === "seller" ? "/seller" : "/admin"));
  const expectedRole = role === "seller" ? "seller" : "admin";
  const email = loginIdentifierToEmail(expectedRole, username);
  let redirectTo = "";

  try {
    if (expectedRole === "admin") {
      await ensureDefaultAdminUser();
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data.user && (await userHasRole(data.user.id, expectedRole))) {
      redirectTo = expectedRole === "seller" ? (next.startsWith("/seller") ? next : "/seller") : next.startsWith("/admin") ? next : "/admin";
    } else {
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error("Login failed", error);
  }

  if (redirectTo) redirect(redirectTo);
  redirect(`/login?role=${expectedRole}&next=${encodeURIComponent(next)}&message=${encodeURIComponent("Invalid login details.")}`);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function submitRegistrationAction(slug: string, formData: FormData) {
  const result = await submitRegistration(slug, formData);
  if (result.ok && result.qrToken) {
    redirect(`/qr/${result.qrToken}?created=1`);
  }
  redirect(`/events/${slug}/register?submitted=${result.ok ? "1" : "0"}&message=${encodeURIComponent(result.message)}`);
}

export async function approveRegistrationAction(formData: FormData) {
  const registrationId = String(formData.get("registration_id"));
  const eventId = String(formData.get("event_id") || "evt_davao_2026");
  await setRegistrationStatus(registrationId, "approved");
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/registrations`);
}

export async function rejectRegistrationAction(formData: FormData) {
  const registrationId = String(formData.get("registration_id"));
  const eventId = String(formData.get("event_id") || "evt_davao_2026");
  await setRegistrationStatus(registrationId, "rejected");
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/registrations`);
}

export async function waitlistRegistrationAction(formData: FormData) {
  const registrationId = String(formData.get("registration_id"));
  const eventId = String(formData.get("event_id") || "evt_davao_2026");
  await setRegistrationStatus(registrationId, "waitlisted");
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/registrations`);
}

export async function checkInCreatorAction(formData: FormData) {
  const registrationId = String(formData.get("registration_id"));
  const eventId = String(formData.get("event_id") || "evt_davao_2026");
  const result = await checkInCreator(registrationId);
  const token = result.qrToken ? `&token=${encodeURIComponent(result.qrToken)}` : "";
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/check-in`);
  redirect(`/admin/events/${eventId}/check-in?message=${encodeURIComponent(result.message)}${token}`);
}

export async function issueSampleClaimAction(formData: FormData) {
  const eventId = String(formData.get("event_id"));
  const token = String(formData.get("token"));
  const productIds = Array.from(new Set(formData.getAll("product_id").map((value) => String(value)).filter(Boolean)));

  if (!productIds.length) {
    const params = new URLSearchParams({
      token,
      result: "no_products",
      message: "Select at least one product sample."
    });
    redirect(`/seller/events/${eventId}/scan?${params.toString()}`);
  }

  const results = [];
  for (const productId of productIds) {
    const quantity = Number(formData.get(`quantity_${productId}`) || 1);
    results.push(await issueSampleClaim(eventId, token, productId, quantity));
  }

  const claimed = results.filter((result) => result.ok).length;
  const failed = results.filter((result) => !result.ok);
  const result = claimed
    ? {
        code: "claimed",
        message: failed.length
          ? `${claimed} sample product${claimed === 1 ? "" : "s"} claimed. ${failed.length} could not be claimed.`
          : `${claimed} sample product${claimed === 1 ? "" : "s"} claimed.`
      }
    : {
        code: failed[0]?.code || "claim_failed",
        message: failed[0]?.message || "No sample products were claimed."
      };
  const params = new URLSearchParams({
    token,
    result: result.code,
    message: result.message
  });
  redirect(`/seller/events/${eventId}/scan?${params.toString()}`);
}

export async function createEventAction(formData: FormData) {
  const banner = formData.get("poster");
  let posterUrl: string | undefined;

  if (banner instanceof File && banner.size > 0) {
    posterUrl = await savePublicUpload(banner);
  }

  const result = await createEvent(formData, posterUrl);
  if (!result.ok || !result.event) {
    redirect(`/admin/events/new?message=${encodeURIComponent(result.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/vismincreatorsclub");
  revalidatePath("/events");
  revalidatePath("/admin/events");
  redirect(`/admin/events/${result.event.id}`);
}

export async function updateEventBannerAction(formData: FormData) {
  const eventId = String(formData.get("event_id") || "");
  const banner = formData.get("poster");

  if (!(banner instanceof File) || banner.size === 0) {
    redirect(`/admin/events/${eventId}?bannerMessage=${encodeURIComponent("Choose a banner image first.")}&bannerResult=error`);
  }

  let posterUrl: string;
  try {
    posterUrl = await savePublicUpload(banner);
  } catch (error) {
    console.error("Banner upload failed", error);
    redirect(`/admin/events/${eventId}?bannerMessage=${encodeURIComponent("Banner upload failed. Please try a smaller image or different file type.")}&bannerResult=error`);
  }
  const result = await updateEventBanner(eventId, posterUrl);
  const params = new URLSearchParams({
    bannerMessage: result.message,
    bannerResult: result.ok ? "success" : "error"
  });

  revalidatePath("/");
  revalidatePath("/vismincreatorsclub");
  revalidatePath("/events");
  if (result.event) {
    revalidatePath(`/events/${result.event.event_slug}`);
    revalidatePath(`/events/${result.event.event_slug}/register`);
  }
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  redirect(`/admin/events/${eventId}?${params.toString()}`);
}

export async function deleteEventAction(formData: FormData) {
  await requireAuth("admin");

  const eventId = String(formData.get("event_id") || "");
  const result = await deleteEvent(eventId);
  const params = new URLSearchParams({
    message: result.message,
    result: result.ok ? "success" : "error"
  });

  revalidatePath("/");
  revalidatePath("/landing");
  revalidatePath("/vismincreatorsclub");
  revalidatePath("/events");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/creators");
  revalidatePath("/seller");
  revalidatePath("/seller/events");
  redirect(`/admin/events?${params.toString()}`);
}

export async function deleteSellerAction(formData: FormData) {
  await requireAuth("admin");

  const sellerId = String(formData.get("seller_id") || "");
  const eventId = String(formData.get("event_id") || "");
  const redirectTo = String(formData.get("redirect_to") || (eventId ? `/admin/events/${eventId}/sellers` : "/admin/sellers"));
  const result = await deleteSeller(sellerId);
  const params = new URLSearchParams({
    sellerMessage: result.message,
    sellerResult: result.ok ? "success" : "error"
  });

  revalidatePath("/admin");
  revalidatePath("/admin/sellers");
  revalidatePath(`/admin/sellers/${sellerId}`);
  revalidatePath("/seller");
  revalidatePath("/seller/events");
  revalidatePath("/seller/products");
  if (eventId) {
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/admin/events/${eventId}/sellers`);
    revalidatePath(`/admin/events/${eventId}/products`);
  }

  redirect(`${redirectTo}?${params.toString()}`);
}

export async function updateSellerAction(formData: FormData) {
  await requireAuth("admin");

  const sellerId = String(formData.get("seller_id") || "");
  const eventId = String(formData.get("event_id") || "");
  const redirectTo = String(formData.get("redirect_to") || (eventId ? `/admin/events/${eventId}/sellers` : `/admin/sellers/${sellerId}`));
  const logo = formData.get("seller_logo");
  let logoUrl: string | undefined;

  if (logo instanceof File && logo.size > 0) {
    logoUrl = await savePublicUpload(logo);
  }

  const result = await updateSeller(formData, logoUrl);
  const params = new URLSearchParams({
    sellerMessage: result.message,
    sellerResult: result.ok ? "success" : "error"
  });

  revalidatePath("/admin");
  revalidatePath("/admin/sellers");
  revalidatePath(`/admin/sellers/${sellerId}`);
  revalidatePath("/seller");
  revalidatePath("/seller/events");
  revalidatePath("/seller/products");
  if (eventId) {
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/admin/events/${eventId}/sellers`);
    revalidatePath(`/admin/events/${eventId}/products`);
  }

  redirect(`${redirectTo}?${params.toString()}`);
}

export async function addEventSellerAction(formData: FormData) {
  const eventId = String(formData.get("event_id") || "");
  const logo = formData.get("seller_logo");
  let logoUrl: string | undefined;

  if (logo instanceof File && logo.size > 0) {
    logoUrl = await savePublicUpload(logo);
  }

  const result = await addEventSeller(formData, logoUrl);
  const password = String(formData.get("password") || "").trim();
  if (result.ok && result.seller && password) {
    await ensureSellerAuthUser(result.seller, password);
  }
  const params = new URLSearchParams({
    sellerMessage: result.message,
    sellerResult: result.ok ? "success" : "error"
  });

  if (result.invite) {
    params.set("inviteEmail", result.invite.email);
    params.set("invitePassword", result.invite.temporary_password);
    params.set("inviteLogin", result.invite.login_url);
  }

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/sellers`);
  revalidatePath(`/admin/events/${eventId}/products`);
  revalidatePath("/seller");
  revalidatePath("/seller/events");
  revalidatePath("/seller/products");
  redirect(`/admin/events/${eventId}/sellers?${params.toString()}`);
}

export async function addBrandAction(formData: FormData) {
  const result = await addBrand(formData);
  const params = new URLSearchParams({
    message: result.message,
    result: result.ok ? "success" : "error"
  });
  revalidatePath("/seller/products");
  redirect(`/seller/products?${params.toString()}`);
}

export async function addProductAction(formData: FormData) {
  const result = await addProduct(formData);
  const params = new URLSearchParams({
    message: result.message,
    result: result.ok ? "success" : "error"
  });
  revalidatePath("/seller/products");
  redirect(`/seller/products?${params.toString()}`);
}

export async function updateProductAction(formData: FormData) {
  const result = await updateProduct(formData);
  const params = new URLSearchParams({
    message: result.message,
    result: result.ok ? "success" : "error"
  });
  revalidatePath("/seller");
  revalidatePath("/seller/products");
  redirect(`/seller/products?${params.toString()}`);
}
