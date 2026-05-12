import { PaymentChannel } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function buildOrderNo() {
  return `ORD${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

export async function POST(request: Request) {
  try {
    const {
      channel,
      amountCny,
    }: {
      channel?: PaymentChannel;
      amountCny?: number;
    } = await request.json();

    if (!channel || !amountCny || amountCny <= 0) {
      return NextResponse.json({ error: "请传入正确的支付渠道和金额" }, { status: 400 });
    }

    const paymentConfig = await prisma.paymentConfig.findUnique({
      where: { channel },
    });

    if (!paymentConfig || !paymentConfig.enabled) {
      return NextResponse.json({ error: `${channel} 尚未配置或未启用` }, { status: 400 });
    }

    const orderNo = buildOrderNo();
    const payUrl =
      channel === "ALIPAY"
        ? `https://openapi.alipay.com/gateway.do?out_trade_no=${orderNo}`
        : `weixin://wxpay/bizpayurl?pr=${orderNo}`;

    const order = await prisma.rechargeOrder.create({
      data: {
        channel,
        orderNo,
        amountCny,
        payUrl,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
