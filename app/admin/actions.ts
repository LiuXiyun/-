"use server";

import { PaymentChannel, Prisma, ModelProviderType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSession, clearAdminSession, requireAdmin } from "@/lib/admin-auth";
import { creditTopup } from "@/lib/billing";
import { encryptText } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function loginAction(formData: FormData) {
  const password = getString(formData, "password");
  const ok = await createAdminSession(password);
  if (!ok) {
    redirect("/admin/login?error=1");
  }

  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveProviderKeyAction(formData: FormData) {
  await requireAdmin();

  const id = getString(formData, "id");
  const name = getString(formData, "name");
  const provider = getString(formData, "provider") as ModelProviderType;
  const apiKey = getString(formData, "apiKey");
  const baseUrl = getString(formData, "baseUrl");
  const note = getString(formData, "note");
  const enabled = getString(formData, "enabled") === "on";

  if (!name || !provider) {
    return;
  }

  const payload: Prisma.ModelProviderKeyUncheckedCreateInput = {
    name,
    provider,
    encryptedKey: apiKey ? encryptText(apiKey) : "MISSING_KEY",
    baseUrl: baseUrl || null,
    note: note || null,
    enabled,
  };

  if (id) {
    await prisma.modelProviderKey.update({
      where: { id },
      data: {
        name,
        provider,
        baseUrl: baseUrl || null,
        note: note || null,
        enabled,
        ...(apiKey ? { encryptedKey: encryptText(apiKey) } : {}),
      },
    });
  } else {
    if (!apiKey) {
      return;
    }
    await prisma.modelProviderKey.create({ data: payload });
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteProviderKeyAction(formData: FormData) {
  await requireAdmin();

  const id = getString(formData, "id");
  if (!id) {
    return;
  }

  await prisma.modelProviderKey.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function savePaymentConfigAction(formData: FormData) {
  await requireAdmin();

  const channel = getString(formData, "channel") as PaymentChannel;
  const appId = getString(formData, "appId");
  const merchantId = getString(formData, "merchantId");
  const privateKey = getString(formData, "privateKey");
  const publicKey = getString(formData, "publicKey");
  const certSerial = getString(formData, "certSerial");
  const apiV3Key = getString(formData, "apiV3Key");
  const gateway = getString(formData, "gateway");
  const notifyUrl = getString(formData, "notifyUrl");
  const enabled = getString(formData, "enabled") === "on";

  if (!channel || !appId) {
    return;
  }

  const existing = await prisma.paymentConfig.findUnique({ where: { channel } });
  if (!existing && !privateKey) {
    return;
  }

  await prisma.paymentConfig.upsert({
    where: { channel },
    create: {
      channel,
      appId,
      merchantId: merchantId || null,
      encryptedKey: encryptText(privateKey),
      publicKey: publicKey || null,
      certSerial: certSerial || null,
      encryptedApiV3Key: apiV3Key ? encryptText(apiV3Key) : null,
      gateway: gateway || null,
      notifyUrl: notifyUrl || null,
      enabled,
    },
    update: {
      appId,
      merchantId: merchantId || null,
      ...(privateKey ? { encryptedKey: encryptText(privateKey) } : {}),
      publicKey: publicKey || null,
      certSerial: certSerial || null,
      ...(apiV3Key ? { encryptedApiV3Key: encryptText(apiV3Key) } : {}),
      gateway: gateway || null,
      notifyUrl: notifyUrl || null,
      enabled,
    },
  });

  revalidatePath("/admin");
}

export async function adjustUserBalanceAction(formData: FormData) {
  await requireAdmin();

  const userId = getString(formData, "userId");
  const amountValue = Number(getString(formData, "amount"));
  const note = getString(formData, "note") || "管理员调整余额";
  if (!userId || Number.isNaN(amountValue) || amountValue === 0) {
    return;
  }

  if (amountValue > 0) {
    await creditTopup({
      userId,
      amountCny: amountValue,
      note,
    });
  } else {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, balanceCny: true },
      });
      if (!user) {
        return;
      }
      const nextBalance = Number((user.balanceCny + amountValue).toFixed(6));
      await tx.user.update({
        where: { id: user.id },
        data: { balanceCny: nextBalance },
      });
      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: "ADJUSTMENT",
          amountCny: amountValue,
          balanceAfterCny: nextBalance,
          note,
        },
      });
    });
  }

    revalidatePath("/admin");
    revalidatePath("/dashboard");
}

export async function savePlanAction(formData: FormData) {
  await requireAdmin();

  const id = getString(formData, "id");
  const name = getString(formData, "name");
  const slug = getString(formData, "slug");
  const description = getString(formData, "description");
  const priceCny = Number(getString(formData, "priceCny"));
  const creditsCny = Number(getString(formData, "creditsCny"));
  const enabled = getString(formData, "enabled") === "on";

  if (!name || !slug || Number.isNaN(priceCny) || Number.isNaN(creditsCny)) {
    return;
  }

  if (id) {
    await prisma.plan.update({
      where: { id },
      data: { name, slug, description, priceCny, creditsCny, enabled },
    });
  } else {
    await prisma.plan.create({
      data: { name, slug, description, priceCny, creditsCny, enabled },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/pricing");
}

export async function replySupportTicketAction(formData: FormData) {
  await requireAdmin();
  const ticketId = getString(formData, "ticketId");
  const adminReply = getString(formData, "adminReply");
  const status = getString(formData, "status");
  if (!ticketId || !adminReply) {
    return;
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      adminReply,
      status: status === "CLOSED" ? "CLOSED" : "REPLIED",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/support");
}

export async function saveAnnouncementAction(formData: FormData) {
  await requireAdmin();
  const id = getString(formData, "id");
  const title = getString(formData, "title");
  const slugInput = getString(formData, "slug");
  const content = getString(formData, "content");
  const enabled = getString(formData, "enabled") === "on";
  if (!title || !content) {
    return;
  }
  const slug = slugify(slugInput || title);
  const publishedAt = enabled ? new Date() : null;

  if (id) {
    await prisma.announcement.update({
      where: { id },
      data: { title, slug, content, enabled, publishedAt },
    });
  } else {
    await prisma.announcement.create({
      data: { title, slug, content, enabled, publishedAt },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/announcements");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireAdmin();
  const id = getString(formData, "id");
  if (!id) {
    return;
  }
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/announcements");
}
