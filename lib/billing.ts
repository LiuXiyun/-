import { Prisma } from "@prisma/client";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export function usdToCny(usd: number) {
  const value = usd * env.CNY_PER_USD * env.CHAT_PRICE_MULTIPLIER;
  return Number(value.toFixed(6));
}

export async function debitForChat(params: {
  userId: string;
  amountCny: number;
  usageLogId: string;
  note: string;
}) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: params.userId },
      select: { id: true, balanceCny: true, invitedById: true, rebateRate: true },
    });
    if (!user) {
      throw new Error("用户不存在");
    }

    const nextBalance = Number((user.balanceCny - params.amountCny).toFixed(6));
    if (nextBalance < -0.001) {
      throw new Error("余额不足");
    }

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: { balanceCny: nextBalance },
      select: { id: true, balanceCny: true },
    });

    await tx.walletTransaction.create({
      data: {
        userId: user.id,
        type: "CHAT_DEBIT",
        amountCny: -params.amountCny,
        balanceAfterCny: updatedUser.balanceCny,
        note: params.note,
        referenceId: params.usageLogId,
      },
    });

    if (user.invitedById) {
      const rebate = Number((params.amountCny * user.rebateRate).toFixed(6));
      if (rebate > 0) {
        const inviter = await tx.user.findUnique({
          where: { id: user.invitedById },
          select: { id: true, balanceCny: true },
        });
        if (inviter) {
          const inviterNext = Number((inviter.balanceCny + rebate).toFixed(6));
          await tx.user.update({
            where: { id: inviter.id },
            data: { balanceCny: inviterNext },
          });
          await tx.walletTransaction.create({
            data: {
              userId: inviter.id,
              type: "REFERRAL_BONUS",
              amountCny: rebate,
              balanceAfterCny: inviterNext,
              note: `下级消费返佣（来源用户 ${user.id}）`,
              referenceId: params.usageLogId,
            },
          });
        }
      }
    }

    return updatedUser;
  });
}

export async function creditTopup(params: {
  userId: string;
  amountCny: number;
  note: string;
  referenceId?: string;
  tx?: Prisma.TransactionClient;
}) {
  const runner = params.tx ?? prisma;

  const user = await runner.user.findUnique({
    where: { id: params.userId },
    select: { id: true, balanceCny: true },
  });
  if (!user) {
    throw new Error("用户不存在");
  }

  const nextBalance = Number((user.balanceCny + params.amountCny).toFixed(6));
  const updatedUser = await runner.user.update({
    where: { id: user.id },
    data: { balanceCny: nextBalance },
    select: { id: true, balanceCny: true },
  });

  await runner.walletTransaction.create({
    data: {
      userId: user.id,
      type: "TOPUP",
      amountCny: params.amountCny,
      balanceAfterCny: updatedUser.balanceCny,
      note: params.note,
      referenceId: params.referenceId,
    },
  });

  return updatedUser;
}
