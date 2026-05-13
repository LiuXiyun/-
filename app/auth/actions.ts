"use server";

import { redirect } from "next/navigation";
import { creditTopup } from "@/lib/billing";
import { env } from "@/lib/env";
import { createUserSession, clearUserSession } from "@/lib/user-auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { createUniqueInviteCode } from "@/lib/referral";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function registerAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const displayName = getString(formData, "displayName");
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirmPassword");
  const inviteCode = getString(formData, "inviteCode").toUpperCase();

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

  const inviter = inviteCode
    ? await prisma.user.findUnique({
        where: { inviteCode },
        select: { id: true },
      })
    : null;
  if (inviteCode && !inviter) {
    redirect("/register?error=邀请码无效");
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        displayName,
        passwordHash: hashPassword(password),
        inviteCode: await createUniqueInviteCode(tx),
        invitedById: inviter?.id,
        rebateRate: env.REFERRAL_REBATE_RATE,
      },
    });

    if (inviter) {
      if (env.REFERRAL_INVITER_BONUS_CNY > 0) {
        await creditTopup({
          userId: inviter.id,
          amountCny: env.REFERRAL_INVITER_BONUS_CNY,
          note: `邀请奖励（邀请用户 ${created.email}）`,
          referenceId: created.id,
          tx,
        });
      }
      if (env.REFERRAL_INVITEE_BONUS_CNY > 0) {
        await creditTopup({
          userId: created.id,
          amountCny: env.REFERRAL_INVITEE_BONUS_CNY,
          note: `新用户邀请奖励（来自邀请码 ${inviteCode}）`,
          referenceId: created.id,
          tx,
        });
      }
    }

    return created;
  });

  await createUserSession(user.id);
  redirect("/dashboard");
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
  redirect("/dashboard");
}

export async function logoutUserAction() {
  await clearUserSession();
  redirect("/");
}
