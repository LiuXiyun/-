import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();
  const orderNo = formData.get("out_trade_no");
  const tradeStatus = formData.get("trade_status");

  if (typeof orderNo !== "string") {
    return new NextResponse("fail", { status: 400 });
  }

  // TODO: 在生产环境中，必须使用支付宝公钥验签后再更新订单状态。
  if (tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED") {
    await prisma.rechargeOrder.updateMany({
      where: { orderNo },
      data: { status: OrderStatus.PAID },
    });
  }

  return new NextResponse("success");
}
