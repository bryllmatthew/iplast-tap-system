"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addBrand,
  addEventSeller,
  addProduct,
  checkInCreator,
  createEvent,
  issueSampleClaim,
  setRegistrationStatus,
  submitRegistration,
  validateSellerLogin,
  updateEventBanner
} from "@/lib/repository";
import { clearSession, setSession, verifyAdminLogin } from "@/lib/auth";

async function savePublicUpload(file: File) {
  const extension = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`.replace(/[^a-zA-Z0-9._-]/g, "");
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

  if (role === "seller") {
    const seller = await validateSellerLogin(username, password);
    if (seller) {
      await setSession({ role: "seller", username: seller.email, sellerId: seller.id });
      redirect(next.startsWith("/seller") ? next : "/seller");
    }
  } else if (verifyAdminLogin(username, password)) {
    await setSession({ role: "admin", username });
    redirect(next.startsWith("/admin") ? next : "/admin");
  }

  redirect(`/login?role=${role === "seller" ? "seller" : "admin"}&next=${encodeURIComponent(next)}&message=${encodeURIComponent("Invalid login details.")}`);
}

export async function logoutAction() {
  await clearSession();
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
  const productId = String(formData.get("product_id"));
  const quantity = Number(formData.get("quantity") || 1);
  const result = await issueSampleClaim(eventId, token, productId, quantity);
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

  const posterUrl = await savePublicUpload(banner);
  const result = await updateEventBanner(eventId, posterUrl);
  const params = new URLSearchParams({
    bannerMessage: result.message,
    bannerResult: result.ok ? "success" : "error"
  });

  revalidatePath("/");
  revalidatePath("/events");
  if (result.event) {
    revalidatePath(`/events/${result.event.event_slug}`);
    revalidatePath(`/events/${result.event.event_slug}/register`);
  }
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  redirect(`/admin/events/${eventId}?${params.toString()}`);
}

export async function addEventSellerAction(formData: FormData) {
  const eventId = String(formData.get("event_id") || "");
  const logo = formData.get("seller_logo");
  let logoUrl: string | undefined;

  if (logo instanceof File && logo.size > 0) {
    logoUrl = await savePublicUpload(logo);
  }

  const result = await addEventSeller(formData, logoUrl);
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
