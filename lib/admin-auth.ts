import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function sign(payload: string) {
  return createHmac("sha256", env.ADMIN_SESSION_SECRET).update(payload).digest("hex");
}

function buildToken(password: string) {
  const payload = `${createHmac("sha256", env.ADMIN_SESSION_SECRET)
    .update(password)
    .digest("hex")}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token?: string) {
  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length < 3) {
    return false;
  }

  const signature = parts.pop();
  if (!signature) {
    return false;
  }

  const payload = parts.join(".");
  const expected = sign(payload);

  if (signature.length !== expected.length) {
    return false;
  }

  const safeMatch = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!safeMatch) {
    return false;
  }

  const [passwordDigest] = payload.split(".", 1);
  const expectedDigest = createHmac("sha256", env.ADMIN_SESSION_SECRET)
    .update(env.ADMIN_PASSWORD)
    .digest("hex");
  return passwordDigest === expectedDigest;
}

export async function createAdminSession(password: string) {
  if (password !== env.ADMIN_PASSWORD) {
    return false;
  }

  const token = buildToken(password);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return true;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    redirect("/admin/login");
  }
}
