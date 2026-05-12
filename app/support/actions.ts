"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createSupportTicketAction(formData: FormData) {
  const user = await requireUser();
  const subject = getString(formData, "subject");
  const content = getString(formData, "content");

  if (!subject || !content) {
    return;
  }

  await prisma.supportTicket.create({
    data: {
      userId: user.id,
      subject,
      content,
    },
  });

  revalidatePath("/support");
  revalidatePath("/dashboard");
}
