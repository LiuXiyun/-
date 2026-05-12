import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { orderNo }: { orderNo?: string } = await request.json();
    if (!orderNo) {
      return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
    }

    const order = await prisma.rechargeOrder.update({
      where: { orderNo },
      data: { status: OrderStatus.PAID },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("模拟支付回调失败:", error);
    return NextResponse.json({ error: "模拟支付回调失败" }, { status: 500 });
  }
}
