import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Role } from "@/lib/types";

const sessionCookie = "tap_session";
const adminUsername = "TAPAdmin";
const adminPassword = "iPlastTAP123!";

export type AuthSession = {
  role: "admin" | "seller";
  username: string;
  sellerId?: string;
};

export function verifyAdminLogin(username: string, password: string) {
  return username === adminUsername && password === adminPassword;
}

export async function getSession(): Promise<AuthSession | null> {
  const store = await cookies();
  const value = store.get(sessionCookie)?.value;
  if (!value) return null;

  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AuthSession;
  } catch {
    return null;
  }
}

export async function setSession(session: AuthSession) {
  const store = await cookies();
  store.set(sessionCookie, Buffer.from(JSON.stringify(session)).toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(sessionCookie);
}

export async function requireAuth(role: Role | "admin" | "seller") {
  const session = await getSession();
  const expected = role === "seller_admin" || role === "seller_staff" || role === "seller" ? "seller" : "admin";

  if (!session || session.role !== expected) {
    redirect(`/login?next=${expected === "seller" ? "/seller" : "/admin"}&role=${expected}`);
  }

  return session;
}
