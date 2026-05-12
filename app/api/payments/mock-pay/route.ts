import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { creditTopup } from "@/lib/billing";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "仅管理员可调用" }, { status: 403 });
    }

    const { orderNo }: { orderNo?: string } = await request.json();
    if (!orderNo) {
      return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      const found = await tx.rechargeOrder.findUnique({
        where: { orderNo },
        select: { id: true, userId: true, amountCny: true, status: true },
      });
      if (!found) {
        throw new Error("订单不存在");
      }

      if (found.status !== "PAID") {
        await tx.rechargeOrder.update({
          where: { id: found.id },
          data: { status: OrderStatus.PAID, paidAt: new Date() },
        });
        await creditTopup({
          userId: found.userId,
          amountCny: found.amountCny,
          note: `模拟充值到账（订单 ${orderNo}）`,
          referenceId: found.id,
          tx,
        });
      }

      return tx.rechargeOrder.findUnique({ where: { id: found.id } });
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("模拟支付回调失败:", error);
    return NextResponse.json({ error: "模拟支付回调失败" }, { status: 500 });
  }
}
