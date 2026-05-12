"use server";

import { redirect } from "next/navigation";
import { createUserSession, clearUserSession } from "@/lib/user-auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function registerAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const displayName = getString(formData, "displayName");
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirmPassword");

  if (!email || !password || !displayName) {
    redirect("/register?error=字段不完整");
  }
  if (password.length < 8) {
    redirect("/register?error=密码至少8位");
  }
  if (password !== confirmPassword) {
    redirect("/register?error=两次密码不一致");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/register?error=邮箱已注册");
  }

  const user = await prisma.user.create({
    data: {
      email,
      displayName,
      passwordHash: hashPassword(password),
    },
  });

  await createUserSession(user.id);
  redirect("/chat");
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  if (!email || !password) {
    redirect("/login?error=请输入邮箱和密码");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=账号或密码错误");
  }

  await createUserSession(user.id);
  redirect("/chat");
}

export async function logoutUserAction() {
  await clearUserSession();
  redirect("/");
}
