import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const USER_COOKIE = "user_session";
const USER_COOKIE_AGE = 60 * 60 * 24 * 14;

function sign(payload: string) {
  return createHmac("sha256", env.USER_SESSION_SECRET).update(payload).digest("hex");
}

function makeToken(userId: string) {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

function parseToken(token?: string) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 3) {
    return null;
  }

  const signature = parts.pop();
  if (!signature) {
    return null;
  }

  const payload = parts.join(".");
  const expected = sign(payload);
  if (signature.length !== expected.length) {
    return null;
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  const [userId] = payload.split(".");
  if (!userId) {
    return null;
  }

  return { userId };
}

export async function createUserSession(userId: string) {
  const token = makeToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: USER_COOKIE_AGE,
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = parseToken(cookieStore.get(USER_COOKIE)?.value);
  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      balanceCny: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
