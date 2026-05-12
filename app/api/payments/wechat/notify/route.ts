import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const orderNo = payload?.out_trade_no as string | undefined;
    const tradeState = payload?.trade_state as string | undefined;

    if (!orderNo) {
      return NextResponse.json({ code: "FAIL", message: "缺少订单号" }, { status: 400 });
    }

    // TODO: 在生产环境中，必须按微信支付 v3 文档校验签名并解密通知报文。
    if (tradeState === "SUCCESS") {
      await prisma.rechargeOrder.updateMany({
        where: { orderNo },
        data: { status: OrderStatus.PAID },
      });
    }

    return NextResponse.json({ code: "SUCCESS", message: "OK" });
  } catch (error) {
    console.error("微信支付回调失败:", error);
    return NextResponse.json({ code: "FAIL", message: "invalid payload" }, { status: 400 });
  }
}
